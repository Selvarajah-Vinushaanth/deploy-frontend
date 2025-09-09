
import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function LyricGenerator() {
  const [motion, setMotion] = useState("calm")
  const [seed, setSeed] = useState("")
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [parsedLyrics, setParsedLyrics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [selectedLyric, setSelectedLyric] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])
  const [viewMode, setViewMode] = useState("cards") // 'cards', 'list', or 'focus'

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [moodUsage, setMoodUsage] = useState({
    அமைதி: 0, // calm
    சந்தோஷம்: 0, // happy
    கவலை: 0, // sad
    காதல்: 0, // romantic
    உற்சாகம்: 0, // energetic
  })
  const [showAnalytics, setShowAnalytics] = useState(false)

  const motions = [
    { value: "அமைதி", label: "Calm / அமைதி", color: "bg-blue-600", icon: "🌊" },
    { value: "சந்தோஷம்", label: "Happy / சந்தோஷம்", color: "bg-yellow-500", icon: "😊" },
    { value: "கவலை", label: "Sad / கவலை", color: "bg-purple-600", icon: "😢" },
    { value: "காதல்", label: "Romantic / காதல்", color: "bg-pink-500", icon: "💖" },
    { value: "உற்சாகம்", label: "Energetic / உற்சாகம்", color: "bg-red-500", icon: "⚡" },
  ]

  useEffect(() => {
    // Reset copied state when lyrics change
    setCopied(false)

    // Parse lyrics into sentences when generatedLyrics changes
    if (generatedLyrics) {
      // Check if generatedLyrics is already an array
      if (Array.isArray(generatedLyrics)) {
        setParsedLyrics(generatedLyrics)
        setSelectedLyric(0)
      } else {
        // If it's a string, split it as before
        const sentences = generatedLyrics
          .split(".")
          .map((sentence) => sentence.trim())
          .filter((sentence) => sentence.length > 0)
          .map((sentence) => (sentence.endsWith(".") ? sentence : sentence + "."))

        setParsedLyrics(sentences)
        setSelectedLyric(0)
      }
    } else {
      setParsedLyrics([])
    }
  }, [generatedLyrics])

  // Add recent searches to the state and update when generating lyrics
  useEffect(() => {
    if (generatedLyrics && seed) {
      setRecentSearches((prev) => {
        const updatedSearches = [seed, ...prev]
        return updatedSearches.slice(0, 5) // Keep only the last 5 searches
      })
    }
  }, [generatedLyrics])

  const handleGenerateLyrics = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post("http://localhost:5000/api/generate-lyrics", {
        motion,
        seed,
      })

      // Check if response.data.lyrics is an array or a string and set accordingly
      if (response.data && response.data.lyrics) {
        setGeneratedLyrics(response.data.lyrics)

        // Track mood usage - ADD THIS
        setMoodUsage((prev) => ({
          ...prev,
          [motion]: prev[motion] + 1,
        }))
      } else {
        // Fallback in case of unexpected response format
        setGeneratedLyrics(seed ? seed : "இங்கே உங்கள் பாடல் வரிகள் தோன்றும்...")
      }
    } catch (error) {
      console.error("Error generating lyrics:", error)
      setError("Failed to generate lyrics. Please try again.")
      setGeneratedLyrics(seed ? seed : "இங்கே உங்கள் பாடல் வரிகள் தோன்றும்...")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text = null) => {
    const textToCopy = text || generatedLyrics
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const lyricExamples = [
    {
      mood: "அமைதி",
      text: "காற்று மெதுவாக வீசுகிறது, மனம் அமைதியாக இருக்கிறது.",
      label: "Calm Example",
    },
    {
      mood: "சந்தோஷம்",
      text: "இன்று என் மனதில் மகிழ்ச்சி பொங்குகிறது.",
      label: "Happy Example",
    },
    {
      mood: "கவலை",
      text: "மழை பொழிகிறது, என் மனதில் கவலை.",
      label: "Sad Example",
    },
    {
      mood: "காதல்",
      text: "உன் கண்கள் என் கனவுகளின் வெளிச்சம்.",
      label: "Romantic Example",
    },
    {
      mood: "உற்சாகம்",
      text: "வானம் கதிர்கள் வீசும், உற்சாகம் நிரம்பும்.",
      label: "Energetic Example",
    },
  ]

  const handleExampleClick = (example) => {
    setSeed(example.text)
    setMotion(example.mood)
  }

  // Add delete functionality for individual and all recent searches
  const handleDeleteSearch = (index) => {
    setRecentSearches((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteAllSearches = () => {
    setShowConfirmation(true)
  }

  const confirmDeleteAll = () => {
    setRecentSearches([])
    setShowConfirmation(false)
  }

  const cancelDeleteAll = () => {
    setShowConfirmation(false)
  }
  const downloadGeneratedLyrics = () => {
    if (!generatedLyrics || parsedLyrics.length === 0) {
      alert("No lyrics generated to download. Please generate lyrics first.")
      return
    }

    // Create content with motion, seed, and all generated lyrics
    const content = [
      `Tamil Lyric Generator Results`,
      `========================`,
      ``,
      `Emotion/Motion: ${motion}`,
      `Initial Seed: ${seed || "None"}`,
      `Generated on: ${new Date().toLocaleString()}`,
      ``,
      `Generated Lyrics:`,
      `================`,
      ``,
      ...parsedLyrics.map((lyric, index) => `${index + 1}. ${lyric}`),
      ``,
      `--`,
      `Generated by Tamil Lyric Generator - Group-23`,
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tamil_lyrics_${motion}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {/* Decorative gradient circles (blue/indigo theme) */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse opacity-70"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse opacity-70" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-60 right-40 w-64 h-64 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse opacity-70" style={{ animationDelay: "1s" }}></div>

      {/* Header with enhanced gradient and glass effect */}
      <header className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-2xl backdrop-blur-sm border-b border-white/10">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              Tamil Lyric <span className="text-blue-200">Generator</span>
            </h1>
            <Link
              to="/"
              className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-300 border border-white/20 shadow-lg backdrop-blur-sm hover:shadow-xl hover:scale-105"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex w-full min-h-screen relative">
        {/* Main Content */}
        <div className="flex-1 p-6 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-100 p-4 mb-6 rounded-xl backdrop-blur-sm shadow-lg">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              Generate Tamil Lyrics
            </h2>

            {/* Enhanced Motion Cards */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-blue-200 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
                Select Mood
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {motions.map((option) => (
                  <button
                    key={option.value}
                    className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 ${
                      motion === option.value
                        ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-600"
                        : "bg-white/10 hover:bg-white/20 border border-white/20"
                    }`}
                    onClick={() => setMotion(option.value)}
                  >
                    <div className="relative z-10 text-center text-white">
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-sm">{option.label.split(" / ")[0]}</div>
                      <div className="text-xs mt-1 opacity-80 font-tamil">{option.label.split(" / ")[1]}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Seed Text Input */}
            <div className="space-y-3">
              <label className="flex items-center text-lg font-semibold text-blue-200 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Initial Sentence (Optional)
              </label>
              <textarea
                className="w-full border border-white/20 bg-white/5 text-white rounded-2xl p-6 h-40 font-tamil focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-inner backdrop-blur-sm placeholder-gray-400"
                placeholder="Enter an initial sentence to inspire your lyrics..."
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </div>

            {/* Enhanced Generate Button */}
            <button
              className={`w-full ${
                isLoading
                  ? "bg-gray-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02]"
              } text-white px-8 py-6 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 font-semibold text-lg backdrop-blur-sm`}
              onClick={handleGenerateLyrics}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generating Beautiful Lyrics...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <span>Generate Lyrics</span>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                </>
              )}
            </button>
          </div>

          {/* Enhanced Output Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 md:space-x-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Generated Lyrics
              </h2>

              {generatedLyrics && (
                <div className="flex flex-wrap gap-3">
                  {/* Enhanced View Mode Toggles */}
                  <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/20">
                    <button
                      onClick={() => handleViewModeChange("cards")}
                      className={`py-2 px-4 rounded-lg transition-all duration-300 ${
                        viewMode === "cards"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewModeChange("list")}
                      className={`py-2 px-4 rounded-lg transition-all duration-300 ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewModeChange("focus")}
                      className={`py-2 px-4 rounded-lg transition-all duration-300 ${
                        viewMode === "focus"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <button
                    onClick={() => copyToClipboard()}
                    className="text-white flex items-center space-x-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm hover:shadow-lg"
                  >
                    {copied ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                        </svg>
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadGeneratedLyrics}
                    className="text-white flex items-center space-x-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Different View Modes for Lyrics */}
            {generatedLyrics ? (
              <>
                {/* Enhanced Cards View */}
                {viewMode === "cards" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parsedLyrics.map((lyric, index) => (
                      <div
                        key={index}
                        className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                          index === selectedLyric
                            ? "bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-2 border-blue-400 shadow-2xl shadow-blue-500/30"
                            : "bg-white/5 border border-white/20 hover:border-blue-400/50 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedLyric(index)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {index + 1}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(lyric)
                            }}
                            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-lg font-tamil leading-relaxed mb-4 text-white">{lyric}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/20">
                          <div className="text-sm text-blue-300 font-medium">{motion}</div>
                          <div className="text-xl">{motions.find((m) => m.value === motion)?.icon || "🎵"}</div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced List View */}
                {viewMode === "list" && (
                  <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                    {parsedLyrics.map((lyric, index) => (
                      <div
                        key={index}
                        className={`group p-5 rounded-xl flex items-start space-x-4 transition-all duration-300 cursor-pointer ${
                          index === selectedLyric
                            ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-400/50 shadow-lg"
                            : "bg-white/5 border border-white/10 hover:border-blue-400/30 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedLyric(index)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <p className="text-lg font-tamil leading-relaxed text-white">{lyric}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(lyric)
                          }}
                          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/20 flex-shrink-0 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced Focus View */}
                {viewMode === "focus" && parsedLyrics.length > 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/20 overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-6 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedLyric((prev) => Math.max(0, prev - 1))}
                          disabled={selectedLyric === 0}
                          className={`p-2 rounded-full transition-all duration-300 ${selectedLyric === 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white hover:bg-white/20"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-blue-200">
                          Lyric {selectedLyric + 1} of {parsedLyrics.length}
                        </span>
                        <button
                          onClick={() => setSelectedLyric((prev) => Math.min(parsedLyrics.length - 1, prev + 1))}
                          disabled={selectedLyric === parsedLyrics.length - 1}
                          className={`p-2 rounded-full transition-all duration-300 ${selectedLyric === parsedLyrics.length - 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white hover:bg-white/20"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-sm px-3 py-1 rounded-full bg-white/20 text-blue-200 backdrop-blur-sm border border-white/30">
                          {motions.find((m) => m.value === motion)?.icon || "🎵"} {motion}
                        </div>
                        <button
                          onClick={() => copyToClipboard(parsedLyrics[selectedLyric])}
                          className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-12 flex flex-col items-center justify-center min-h-[300px] relative">
                      <div className="absolute top-8 left-8 text-6xl text-blue-300/30 font-serif">"</div>
                      <p className="text-3xl text-center font-tamil leading-relaxed max-w-3xl text-white relative z-10 px-8">
                        {parsedLyrics[selectedLyric]}
                      </p>
                      <div className="absolute bottom-8 right-8 text-6xl text-blue-300/30 font-serif">"</div>
                    </div>

                    <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 flex justify-center space-x-2">
                      {parsedLyrics.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedLyric(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === selectedLyric
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"
                              : "bg-white/30 hover:bg-white/50"
                          }`}
                          aria-label={`Go to lyric ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="min-h-[400px] rounded-2xl bg-white/5 p-8 border border-white/20 flex flex-col items-center justify-center text-gray-400 space-y-6 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl text-blue-200">Generated lyrics will appear here</p>
                  <p className="text-sm text-gray-400 max-w-md">
                    Select a mood, optionally provide an initial sentence, and click "Generate Lyrics" to create
                    beautiful Tamil lyrics
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 mt-8 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Recent Searches
                </h2>
                <button
                  onClick={handleDeleteAllSearches}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-xl text-sm transition-all duration-300 border border-red-500/30"
                >
                  Delete All
                </button>
              </div>
              <ul className="space-y-3">
                {recentSearches.map((search, index) => (
                  <li
                    key={index}
                    className="bg-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all duration-300 border border-white/10 group"
                  >
                    <span className="cursor-pointer text-white font-tamil flex-grow" onClick={() => setSeed(search)}>
                      {search}
                    </span>
                    <button
                      onClick={() => handleDeleteSearch(index)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enhanced Confirmation Popup */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-8 w-96 text-center backdrop-blur-xl shadow-2xl">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete All</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete all recent searches? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={confirmDeleteAll}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={cancelDeleteAll}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Analytics Toggle Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>{showAnalytics ? "Hide Analytics" : "Show Mood Analytics"}</span>
            </button>
          </div>

          {/* Enhanced Mood Distribution Chart */}
          {showAnalytics && (
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl mt-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  Mood Usage Distribution
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-center">
                <div className="bg-white/5 rounded-2xl p-8 w-full max-w-2xl border border-white/20 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-6 text-center text-blue-200">Your Generation Preferences</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={Object.entries(moodUsage).map(([mood, count]) => ({
                          name: motions.find((m) => m.value === mood)?.label.split(" / ")[0] || mood,
                          value: count,
                          icon: motions.find((m) => m.value === mood)?.icon || "🎵",
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) =>
                          value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(moodUsage).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#3B82F6", "#EAB308", "#8B5CF6", "#EC4899", "#EF4444"][index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} generations`, name]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          color: "#ffffff",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Enhanced Quick Stats */}
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 text-center border border-blue-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-blue-300 mb-1">
                        {Object.values(moodUsage).reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">Total Generations</div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-800/20 rounded-xl p-4 text-center border border-indigo-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-indigo-300 mb-1">
                        {
                          Object.entries(moodUsage).reduce(
                            (maxEntry, [mood, count]) => (count > maxEntry[1] ? [mood, count] : maxEntry),
                            ["calm", 0],
                          )[0]
                        }
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">Favorite Mood</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-800/20 rounded-xl p-4 text-center border border-purple-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-purple-300 mb-1">{parsedLyrics.length}</div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">Current Lyrics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Right Sidebar for Examples */}
        <aside className="w-1/4 px-6 bg-white/5 border-l border-white/10 rounded-l-2xl shadow-2xl overflow-y-auto backdrop-blur-xl">
          <div className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/10 pb-4 mb-6">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 text-center flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Lyric Examples
            </h3>
          </div>

          <div className="space-y-4">
            {lyricExamples.map((example, idx) => (
              <div
                key={idx}
                className="group bg-white/5 rounded-xl p-5 border border-white/20 cursor-pointer hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white/10 transform hover:scale-105"
                onClick={() => handleExampleClick(example)}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">{motions.find((m) => m.value === example.mood)?.icon || "🎵"}</span>
                  </div>
                  <span className="font-semibold text-blue-200">{example.label}</span>
                </div>
                <p className="font-tamil text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {example.text}
                </p>

                <div className="mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-blue-300">Click to use as seed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-xl text-center border border-blue-500/20">
            <p className="text-xs text-blue-300 font-medium">💡 Click any example to use it as your starting point!</p>
          </div>
        </aside>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative mt-12 py-8 text-center text-gray-400 text-sm border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6 space-y-4 md:space-y-0 md:space-x-8">
            {motions.map((motion) => (
              <div key={motion.value} className="flex items-center space-x-2 group">
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-r ${motion.color.replace("bg-", "from-")} to-indigo-600 group-hover:scale-110 transition-transform duration-300`}
                ></div>
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors duration-300">
                  {motion.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-blue-200 font-medium">Tamil Lyric Generator &copy; 2025</span>
            </div>
            <span className="hidden md:inline text-white/30">|</span>
            <div className="text-indigo-200">Created by Group-23</div>
          </div>
          <p className="text-gray-500 text-xs mb-6">Powered by advanced natural language processing</p>

          <div className="flex justify-center space-x-6">
            {[
              {
                icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
                label: "GitHub",
              },
              {
                icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.037 10.037 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z",
                label: "Twitter",
              },
              {
                icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                label: "Instagram",
              },
            ].map((social, index) => (
              <button
                key={index}
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={social.icon} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
