import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Users, CheckCircle, Plus, Upload, X, Image } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [formData, setFormData] = useState({
    companyId: "",
    branch: "",
    passoutYear: "",
    name: "",
    company: "",
    role: "",
    numberOfRounds: 0,
    rounds: [],
    ctcOffered: "",
    eligibilityCriteria: "",
    linkedin: "",
    internshipOffered: false,
    internshipMonths: "",
    image: "", // Added image field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  const dropdownRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCompanySuggestions([]);
        setShowAddOption(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNumberOfRoundsChange = (value) => {
    const isFivePlus = value === "5+";
    const roundCount = isFivePlus ? 5 : parseInt(value) || 0;

    const rounds = Array.from({ length: roundCount }, (_, i) => ({
      round: i + 1,
      name: formData.rounds[i]?.name || "",
      experience: formData.rounds[i]?.experience || "",
      mode: formData.rounds[i]?.mode || "",
    }));

    setFormData({
      ...formData,
      numberOfRounds: value,
      rounds,
    });

    setShowAddButton(isFivePlus);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase(); // Ensure all input is uppercase

    setFormData((prev) => ({
      ...prev,
      [name]: upperValue,
      ...(name === "company" && { companyId: "" }),
    }));

    // Handle dynamic company search with delay
    if (name === "company") {
      if (searchTimeout) clearTimeout(searchTimeout);
      setSearchTimeout(
        setTimeout(() => {
          fetchCompanySuggestions(upperValue);
        }, 300),
      );
    }
  };

  const fetchCompanySuggestions = async (query) => {
    try {
      const { data } = await axios.get(
        `https://codex-test-server.onrender.com/api/company/search?query=${query}`,
      );
      setCompanySuggestions(data || []);
      setShowAddOption(
        query &&
          data.every((comp) => comp.name.toLowerCase() !== query.toLowerCase()),
      );
    } catch (err) {
      console.error("Error fetching companies", err);
      setCompanySuggestions([]);
    }
  };

  const handleCompanyAddSelect = async (selectedName) => {
    if (selectedName.startsWith("ADD::")) {
      setIsAddingCompany(true);
      const actualName = selectedName.replace("ADD::", "");
      try {
        const res = await axios.post(
          "https://codex-test-server.onrender.com/api/company/add",
          {
            name: actualName,
          },
        );
        setFormData((prev) => ({
          ...prev,
          company: res.data.name,
          companyId: res.data._id,
        }));
        setCompanySuggestions([]);
        setShowAddOption(false);
      } catch (err) {
        console.error("Error adding company", err);
      } finally {
        setIsAddingCompany(false);
      }
    }
  };

  const handleCompanySelect = async (selectedCompany) => {
    if (selectedCompany) {
      setFormData((prev) => ({
        ...prev,
        company: selectedCompany.name,
        companyId: selectedCompany._id,
      }));
      setCompanySuggestions([]);
      setShowAddOption(false);
    }
  };

  // Image upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", selectedFile);

    try {
      const response = await axios.post(
        "https://codex-test-server.onrender.com/api/image/upload",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Assuming the API returns the image string/URL
      const imageString =
        response.data.imageUrl || response.data.image || response.data;

      setFormData((prev) => ({ ...prev, image: imageString }));
      setSelectedFile(null);
      setIsImageUploaded(true); // ✅ mark uploaded
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
    setIsImageUploaded(false); // ✅ mark removed

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRoundExperienceChange = (roundIndex, experience) => {
    const updatedRounds = [...formData.rounds];
    updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], experience };
    setFormData({ ...formData, rounds: updatedRounds });
  };
  const handleRoundNameChange = (roundIndex, name) => {
    const updatedRounds = [...formData.rounds];
    updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], name };
    setFormData({ ...formData, rounds: updatedRounds });
  };
  const handleRoundModeChange = (roundIndex, mode) => {
    const updatedRounds = [...formData.rounds];
    updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], mode };
    setFormData({ ...formData, rounds: updatedRounds });
  };

  const addNewRound = () => {
    const newRound = {
      round: formData.rounds.length + 1,
      name: "",
      experience: "",
      mode: "",
    };
    setFormData({
      ...formData,
      rounds: [...formData.rounds, newRound],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name: formData.name,
      year: formData.passoutYear,
      dept: formData.branch ? formData.branch.toUpperCase() : "",
      companyId: formData.companyId,
      companyName: formData.company,
      role: formData.role,
      isInternshipOrTrainingProvided: formData.internshipOffered,
      internshipPeriodInMonths: formData.internshipOffered
        ? Number(formData.internshipMonths) || 0
        : 0,
      numberOfRounds: formData.rounds.length,
      ctcOffered: Number(formData.ctcOffered) || 0,
      rounds: formData.rounds.map((round) => ({
        round_name: round.name,
        isRoundOffline: round.mode === "Offline",
        description: round.experience,
      })),
      linkedinUrl: formData.linkedin,
      eligibilityCriteria: formData.eligibilityCriteria,
      image: formData.image, // Added image field to payload
    };

    try {
      const response = await fetch(
        "https://codex-test-server.onrender.com/api/interviewExperience",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit experience.");
      }

      setIsSubmitted(true);
    } catch (error) {
      alert(
        error.message || "An error occurred while submitting your experience.",
      );
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      passoutYear: "",
      name: "",
      company: "",
      role: "",
      numberOfRounds: 0,
      rounds: [],
      ctcOffered: "",
      eligibilityCriteria: "",
      linkedin: "",
      internshipOffered: false,
      internshipMonths: "",
      image: "",
    });
    setShowAddButton(false);
    setSelectedFile(null);
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* CODEX Title */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-white animate-codex-glow">
            CODEX
          </h1>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-5 mb-4">
            <div className="w-5 h-5 sm:w-8 sm:h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <Users className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-l sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Share Your Interview Experience
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto">
            Help fellow students by sharing your interview journey. Your
            experience could be the key to someone else's success.
          </p>
        </div>

        {/* Form */}
        {!isSubmitted && (
          <div className="bg-gradient-to-br from-black via-gray-950 to-slate-950 border border-sky-500/70 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-black/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Branch and Passout Year */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Branch <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                    style={{
                      colorScheme: "dark",
                    }}
                  >
                    <option value="" disabled hidden>
                      Select Branch
                    </option>
                    <option value="Computer" className="bg-gray-900 text-white">
                      COMPUTER
                    </option>
                    <option value="IT" className="bg-gray-900 text-white">
                      IT
                    </option>
                    <option value="CSD" className="bg-gray-900 text-white">
                      CSD
                    </option>
                    <option value="AIDS" className="bg-gray-900 text-white">
                      AIDS
                    </option>
                    <option value="ENTC" className="bg-gray-900 text-white">
                      ENTC
                    </option>
                    <option value="ROBOTICS" className="bg-gray-900 text-white">
                      ROBOTICS
                    </option>
                    <option value="Other" className="bg-gray-900 text-white">
                      Other
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Passout Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.passoutYear}
                    onChange={(e) =>
                      setFormData({ ...formData, passoutYear: e.target.value })
                    }
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                    style={{
                      colorScheme: "dark",
                    }}
                  >
                    <option value="" disabled hidden>
                      Select Year
                    </option>
                    <option value="2024" className="bg-gray-900 text-white">
                      2024
                    </option>
                    <option value="2025" className="bg-gray-900 text-white">
                      2025
                    </option>
                    <option value="2026" className="bg-gray-900 text-white">
                      2026
                    </option>
                  </select>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                    placeholder="Your name"
                  />
                </div>
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Type to Search..."
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner uppercase"
                    autoComplete="off"
                  />
                  {(companySuggestions.length > 0 || showAddOption) && (
                    <ul className="absolute bg-gray-900 border border-gray-700/60 w-full z-10 max-h-40 overflow-y-auto mt-1 rounded-lg shadow-2xl shadow-black/50">
                      {companySuggestions.map((company, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleCompanySelect(company)}
                          className="px-4 py-2 text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                        >
                          {company.name}
                        </li>
                      ))}
                      {showAddOption && (
                        <li
                          onClick={() =>
                            handleCompanyAddSelect("ADD::" + formData.company)
                          }
                          className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-white cursor-pointer font-medium transition-colors duration-200 border-t border-gray-700/50 flex items-center justify-between"
                        >
                          {isAddingCompany ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-opacity-50 mr-2"></span>
                          ) : (
                            <>➕ Add "{formData.company}"</>
                          )}
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                    placeholder="Software Engineer, Data Analyst, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Number of Rounds <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.numberOfRounds}
                    onChange={(e) => handleNumberOfRoundsChange(e.target.value)}
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                    style={{
                      colorScheme: "dark",
                    }}
                  >
                    <option value="">
                      Select number of rounds
                    </option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option
                        key={num}
                        value={num}
                        className="bg-gray-900 text-white"
                      >
                        {num} {num > 1 ? "" : ""}
                      </option>
                    ))}
                    <option value="5+" className="bg-gray-900 text-white">
                      5+ Rounds
                    </option>
                  </select>
                </div>
              </div>

              {/* Dynamic Round Fields */}
              {formData.rounds.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 border-b border-slate-700/70 pb-2">
                    Interview Rounds
                  </h3>
                  {formData.rounds.map((round, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-700/50 rounded-lg p-2 sm:p-4 transition-all duration-300 ease-in-out hover:border-gray-600/70 shadow-lg shadow-black/20 backdrop-blur-sm"
                    >
                      <label className="block text-sm font-medium text-slate-200 mb-3">
                        Round {round.round}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Name
                      </label>
                      <select
                        required
                        value={round.name}
                        onChange={(e) =>
                          handleRoundNameChange(index, e.target.value)
                        }
                        className="w-full bg-gradient-to-r from-gray-950 to-black border border-gray-600/60 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-500 shadow-inner [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                        style={{
                          colorScheme: "dark",
                        }}
                      >
                        <option value="" disabled hidden>
                          Select round type
                        </option>
                        <option
                          value="Aptitude"
                          className="bg-gray-900 text-white"
                        >
                          Aptitude
                        </option>
                        <option
                          value="Technical 1"
                          className="bg-gray-900 text-white"
                        >
                          Technical 1
                        </option>
                        <option
                          value="Technical 2"
                          className="bg-gray-900 text-white"
                        >
                          Technical 2
                        </option>
                        <option
                          value="Coding"
                          className="bg-gray-900 text-white"
                        >
                          Coding
                        </option>
                        <option value="HR" className="bg-gray-900 text-white">
                          HR
                        </option>
                        <option
                          value="Group discussion (GD)"
                          className="bg-gray-900 text-white"
                        >
                          Group discussion (GD)
                        </option>
                        <option
                          value="Essay Writing"
                          className="bg-gray-900 text-white"
                        >
                          Essay Writing
                        </option>
                      </select>
                      <div className="mt-2 mb-2">
                        <span className="block text-sm font-medium text-slate-200 mb-1">
                          Mode
                        </span>
                        <div className="flex gap-6 sm:gap-8 items-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode-${index}`}
                              value="Online"
                              checked={round.mode === "Online"}
                              onChange={() =>
                                handleRoundModeChange(index, "Online")
                              }
                              className="accent-sky-500 w-5 h-5 sm:w-6 sm:h-6 border-2 border-sky-500 focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
                              required
                            />
                            <span className="ml-3 text-slate-200 text-base sm:text-lg font-medium select-none">
                              Online
                            </span>
                          </label>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode-${index}`}
                              value="Offline"
                              checked={round.mode === "Offline"}
                              onChange={() =>
                                handleRoundModeChange(index, "Offline")
                              }
                              className="accent-sky-500 w-5 h-5 sm:w-6 sm:h-6 border-2 border-sky-500 focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
                              required
                            />
                            <span className="ml-3 text-slate-200 text-base sm:text-lg font-medium select-none">
                              Offline
                            </span>
                          </label>
                        </div>
                      </div>
                      <label className="block text-sm font-medium text-slate-200 mt-2 mb-2">
                        Experience
                      </label>
                      <textarea
                        required
                        value={round.experience}
                        onChange={(e) =>
                          handleRoundExperienceChange(index, e.target.value)
                        }
                        rows={3}
                        className="w-full bg-gradient-to-r from-gray-950 to-black border border-gray-600/60 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-500 shadow-inner"
                        placeholder={`Share your experience (technical questions, coding problems etc.)`}
                      />
                    </div>
                  ))}
                  {showAddButton && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={addNewRound}
                        className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border border-gray-600/50 hover:border-gray-500 shadow-lg shadow-black/30 hover:shadow-black/40 transform hover:scale-105 backdrop-blur-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Round
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    CTC Offered <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex items-center justify-center text-base sm:text-lg font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.ctcOffered}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*(\.\d{0,2})?$/.test(val)) {
                          setFormData({ ...formData, ctcOffered: val });
                        }
                      }}
                      inputMode="decimal"
                      pattern="^\\d*(\\.\\d{0,2})?$"
                      className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg pl-11 pr-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                      placeholder="e.g. 6.45 LPA"
                      style={{ MozAppearance: "textfield" }}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Upload Image{" "}
                  <span className="text-gray-400 text-xs sm:text-sm">
                    (Optional - Max 5MB)
                  </span>
                </label>

                {!uploadPreview && !formData.image ? (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-sky-500/50 transition-all duration-300 hover:bg-gray-900/20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-sky-500" />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            Click to upload image
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : uploadPreview ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={uploadPreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium truncate">
                            {selectedFile?.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {selectedFile &&
                              (selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={uploadImage}
                        disabled={isUploading || isImageUploaded}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : formData.image ? (
                  <div className="bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Image className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">
                          Image uploaded successfully
                        </p>
                        <p className="text-gray-400 text-sm">Ready to submit</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* LinkedIn Profile URL */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  LinkedIn Profile URL{" "}
                  <span className="text-gray-400 text-xs sm:text-sm">
                    (Optional)
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </div>

              {/* Internship Offered Toggle */}
              <div className="flex items-center gap-4 mt-4">
                <span className="block text-sm font-medium text-slate-200">
                  Internship Offered?
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      internshipOffered: !formData.internshipOffered,
                      internshipMonths: "",
                    })
                  }
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    formData.internshipOffered
                      ? "bg-gradient-to-r from-sky-500 to-sky-600"
                      : "bg-gradient-to-r from-gray-600 to-gray-700"
                  } shadow-inner`}
                  aria-pressed={formData.internshipOffered}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg ${
                      formData.internshipOffered
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-200">
                  {formData.internshipOffered ? "Yes" : "No"}
                </span>
              </div>
              {formData.internshipOffered && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Internship period?
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.internshipMonths}
                    onChange={(e) => {
                      // Only allow positive integers
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setFormData({ ...formData, internshipMonths: val });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                    placeholder="e.g. 6"
                  />
                </div>
              )}

              {/* Eligibility Criteria */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Eligibility Criteria{" "}
                  <span className="text-gray-400 text-xs sm:text-sm">
                    (Optional)
                  </span>
                </label>
                <textarea
                  value={formData.eligibilityCriteria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibilityCriteria: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-gradient-to-r from-black to-gray-950 border border-gray-700/60 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/70 transition-all duration-300 hover:border-gray-600 shadow-inner"
                  placeholder="CGPA requirements, branch eligibility, any specific criteria..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className={`bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-400 hover:via-sky-500 hover:to-sky-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base shadow-xl shadow-sky-900/30 hover:shadow-sky-800/40 border border-sky-400/20 ${
                    isLoading || isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 sm:w-5 sm:h-5" />
                      Submit Experience
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Thank You Message (always shown after submit) */}
        {isSubmitted && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center mx-auto mt-8">
            <div className="bg-sky-500 bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-sky-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">
              Your interview experience has been successfully submitted and will
              help other students prepare better.
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsSubmitted(false);
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Share Another Experience
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs sm:text-sm">
            Your shared experience will help thousands of students prepare
            better for their interviews.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;