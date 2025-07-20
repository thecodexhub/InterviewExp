import React, { useState } from 'react';
import { Send, Users, Briefcase, Calendar, DollarSign, CheckCircle, Plus } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function App() {
  const [formData, setFormData] = useState({
    branch: '',
    passoutYear: '',
    name: '',
    company: '',
    role: '',
    numberOfRounds: 0,
    rounds: [],
    ctcOffered: '',
    eligibilityCriteria: '',
    linkedin: '',
    internshipOffered: false,
    internshipMonths: '',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  const handleNumberOfRoundsChange = (value) => {
    const isFivePlus = value === '5+';
    const roundCount = isFivePlus ? 5 : parseInt(value) || 0;

    const rounds = Array.from({ length: roundCount }, (_, i) => ({
      round: i + 1,
      name: formData.rounds[i]?.name || '',
      experience: formData.rounds[i]?.experience || '',
      mode: formData.rounds[i]?.mode || '',
    }));

    setFormData({
      ...formData,
      numberOfRounds: value,
      rounds,
    });

    setShowAddButton(isFivePlus);
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
      name: '',
      experience: '',
      mode: '',
    };
    setFormData({
      ...formData,
      rounds: [...formData.rounds, newRound],
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare the payload as per API requirements
    const payload = {
      name: formData.name,
      year: formData.passoutYear,
      dept: formData.branch ? formData.branch.toUpperCase() : '',
      companyName: formData.company,
      role: formData.role,
      isInternshipOrTrainingProvided: formData.internshipOffered,
      internshipPeriodInMonths: formData.internshipOffered ? Number(formData.internshipMonths) || 0 : 0,
      numberOfRounds: formData.rounds.length,
      ctcOffered: Number(formData.ctcOffered) || 0,
      rounds: formData.rounds.map(round => ({
        round_name: round.name,
        isRoundOffline: round.mode === 'Offline',
        description: round.experience,
      })),
      linkedinUrl: formData.linkedin,
      eligibilityCriteria: formData.eligibilityCriteria,
    };

    try {
      console.log("Payload being sent:", payload);
      const response = await fetch('https://codex-test-server.onrender.com/api/interviewExperience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to submit experience.');
      }
      setIsSubmitted(true);
    } catch (error) {
      alert(error.message || 'An error occurred while submitting your experience.');
    }
  };

  const resetForm = () => {
    setFormData({
      branch: '',
      passoutYear: '',
      name: '',
      company: '',
      role: '',
      numberOfRounds: 0,
      rounds: [],
      ctcOffered: '',
      eligibilityCriteria: '',
      linkedin: '',
      internshipOffered: false,
      internshipMonths: '',
    });
    setShowAddButton(false);
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
            Help fellow students by sharing your interview journey. Your experience could be the key to someone else's success.
          </p>
        </div>

        {/* Form */}
        {!isSubmitted && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Branch and Passout Year */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Branch <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  >
                    <option value="">Select branch</option>
                    <option value="Computer">COMPUTER</option>
                    <option value="IT">IT</option>
                    <option value="CSD">CSD</option>
                    <option value="AIDS">AIDS</option>
                    <option value="ENTC">ENTC</option>
                    <option value="ROBOTICS">ROBOTICS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Passout Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.passoutYear}
                    onChange={e => setFormData({ ...formData, passoutYear: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  >
                    <option value="">Select year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    {/* <option value="2027">2027</option> */}
                  </select>
                </div>
              </div>
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value.toUpperCase() })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500"
                      placeholder="Company name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500"
                    placeholder="Software Engineer, Data Analyst, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Rounds <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.numberOfRounds}
                    onChange={(e) => handleNumberOfRoundsChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white cursor-pointer"
                  >
                    <option value={0}>Select number of rounds</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num > 1 ? '' : ''}</option>
                    ))}
                    <option value="5+">5+ Rounds</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Round Fields */}
              {formData.rounds.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Interview Rounds
                  </h3>
                  {formData.rounds.map((round, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-2 sm:p-4 transition-all duration-300 ease-in-out"
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Round {round.round} <span className="text-red-400">*</span>
                      </label>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <select
                        required
                        value={round.name}
                        onChange={(e) => handleRoundNameChange(index, e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                      >
                        <option value="">Select round type</option>
                        <option value="Aptitude">Aptitude</option>
                        <option value="Technical 1">Technical 1</option>
                        <option value="Technical 2">Technical 2</option>
                        <option value="Coding">Coding</option>
                        <option value="HR">HR</option>
                        <option value="Group discussion (GD)">Group discussion (GD)</option>
                        <option value="Essay Writing">Essay Writing</option>
                      </select>
                      <div className="mt-2 mb-2">
                        <span className="block text-sm font-medium text-gray-300 mb-1">Mode</span>
                        <div className="flex gap-6 sm:gap-8 items-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode-${index}`}
                              value="Online"
                              checked={round.mode === 'Online'}
                              onChange={() => handleRoundModeChange(index, 'Online')}
                              className="accent-sky-500 w-5 h-5 sm:w-6 sm:h-6 border-2 border-sky-500 focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                              required
                            />
                            <span className="ml-3 text-gray-200 text-base sm:text-lg font-medium select-none">Online</span>
                          </label>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`mode-${index}`}
                              value="Offline"
                              checked={round.mode === 'Offline'}
                              onChange={() => handleRoundModeChange(index, 'Offline')}
                              className="accent-sky-500 w-5 h-5 sm:w-6 sm:h-6 border-2 border-sky-500 focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                              required
                            />
                            <span className="ml-3 text-gray-200 text-base sm:text-lg font-medium select-none">Offline</span>
                          </label>
                        </div>
                      </div>
                      <label className="block text-sm font-medium text-gray-300 mt-2 mb-2">
                        Experience
                      </label>
                      <textarea
                        required
                        value={round.experience}
                        onChange={(e) => handleRoundExperienceChange(index, e.target.value)}
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 resize-none text-sm sm:text-base"
                        placeholder={`Share your experience (technical questions, coding problems etc.)`}
                      />
                    </div>
                  ))}

                  {showAddButton && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={addNewRound}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-gray-600 hover:border-gray-500"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CTC Offered <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    {/* Replace icon with rupee sign */}
                    <span className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex items-center justify-center text-base sm:text-lg font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.ctcOffered}
                      onChange={(e) => {
                        // Allow only numbers with up to 2 decimal places
                        const val = e.target.value;
                        if (/^\d*(\.\d{0,2})?$/.test(val)) {
                          setFormData({ ...formData, ctcOffered: val });
                        }
                      }}
                      inputMode="decimal"
                      pattern="^\\d*(\\.\\d{0,2})?$"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500 appearance-none"
                      placeholder="e.g. 6.45 LPA"
                      style={{ MozAppearance: 'textfield' }}
                      onWheel={e => e.target.blur()}
                    />
                  </div>
                </div>
              </div>

              {/* LinkedIn Profile URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn Profile URL <span className="text-gray-500 text-xs sm:text-sm">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </div>
              {/* Internship Offered Toggle */}
              <div className="flex items-center gap-4 mt-4">
                <span className="block text-sm font-medium text-gray-300">Internship Offered?</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, internshipOffered: !formData.internshipOffered, internshipMonths: '' })}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.internshipOffered ? 'bg-sky-500' : 'bg-gray-600'}`}
                  aria-pressed={formData.internshipOffered}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.internshipOffered ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <span className="text-sm text-gray-300">{formData.internshipOffered ? 'Yes' : 'No'}</span>
              </div>
              {formData.internshipOffered && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Internship period?
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.internshipMonths}
                    onChange={e => {
                      // Only allow positive integers
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setFormData({ ...formData, internshipMonths: val });
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500"
                    placeholder="e.g. 6"
                  />
                </div>
              )}
              {/* Eligibility Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Eligibility Criteria <span className="text-gray-500 text-xs sm:text-sm">(Optional)</span>
                </label>
                <textarea
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 text-sm sm:text-base py-2 sm:py-3 text-white placeholder-gray-500 resize-none"
                  placeholder="CGPA requirements, branch eligibility, any specific criteria..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  className="bg-sky-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Send className="w-3 h-3 sm:w-5 sm:h-5" />
                  Submit Experience
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
              Your interview experience has been successfully submitted and will help other students prepare better.
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
            Your shared experience will help thousands of students prepare better for their interviews.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;