
import { useState } from "react"
import { Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
// import { toast, ToastContainer } from "react-toastify"

export default function MaskingPredict() {
  const [inputText, setInputText] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [feedback, setFeedback] = useState("")

  const examples = [
  "நான் [mask] வீட்டிற்கு செல்கிறேன்",
  "அவர் [mask] உணவு சாப்பிட்டார்",
  "அவர்கள் [mask] பாடசாலைக்கு போனார்கள்",
  "அவள் [mask] பாடலை பாடினாள்",
  "நாம் [mask] விளையாடுகிறோம்"
]


  function handleExampleClick(example) {
    setInputText(example)
  }

  function handlePredict() {
    if (!inputText.includes("[mask]")) {
      toast.error("Please include [mask] in your sentence", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }
    
    setIsLoading(true)
    setRecentSearches((prev) => [inputText, ...prev.filter((s) => s !== inputText)].slice(0, 5))
    
    // Make API call to the backend
    const API_URL = process.env.NODE_ENV === 'production' 
      ? "https://tamil-ai-models-backend.vercel.app/api/predict-mask" 
      : "http://localhost:5000/api/predict-mask";
      
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: inputText,
        top_k: 4 // Get 4 suggestions
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        setSuggestions(data.suggestions)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error:", error)
        toast.error("Failed to get predictions. Using fallback suggestions.", {
          position: "top-right",
          autoClose: 3000,
        })
        // Fallback to dummy data if API fails
        setSuggestions(["walk", "go", "run", "travel"])
        setIsLoading(false)
      })
  }

  function handleFeedbackSubmit() {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback before submitting.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }
    
    console.log("Feedback submitted:", feedback)
    setFeedback("")
    toast.success("Thank you for your feedback!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-lime-900 to-black text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {/* Decorative gradient circles */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-600/20 to-lime-600/20 rounded-full blur-3xl animate-pulse opacity-70"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-r from-emerald-600/20 to-lime-600/20 rounded-full blur-3xl animate-pulse opacity-70" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-60 right-40 w-64 h-64 bg-gradient-to-r from-green-600/20 to-lime-600/20 rounded-full blur-3xl animate-pulse opacity-70" style={{ animationDelay: "1s" }}></div>

      <ToastContainer />
      <header className="bg-gradient-to-r from-green-900/90 via-lime-800/90 to-green-900/90 backdrop-blur-xl text-white p-6 shadow-2xl border-b border-green-700/30">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-200 to-lime-200 bg-clip-text text-transparent">
              Masking <span className="text-lime-300">Predict</span>
            </h1>
            <Link
              to="/"
              className="bg-green-900/30 hover:bg-green-800/40 px-6 py-3 rounded-xl transition-all duration-300 border border-green-600/30 shadow-lg hover:shadow-green-500/20 backdrop-blur-sm"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto p-6 space-y-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-800/80 via-green-900/40 to-lime-900/60 backdrop-blur-xl border border-green-700/30 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300 hover:shadow-green-500/20 hover:border-green-600/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-lime-100 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-2xl">🕵️‍♂️</span>
                  </div>
                  Enter Sentence with [mask]
                </h2>
                {isLoading && (
                  <span className="text-xs bg-green-800/40 text-lime-200 px-3 py-2 rounded-full animate-pulse border border-green-600/30 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"></div>
                      <span>Processing...</span>
                    </div>
                  </span>
                )}
              </div>
              <input
                className="w-full border border-green-600/30 bg-slate-800/70 text-lime-50 rounded-xl p-6 font-tamil focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all shadow-inner backdrop-blur-sm placeholder-lime-300/50 mb-4 text-lg"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a sentence with [mask]..."
              />
              <p className="text-xs text-lime-300/70 mt-3 mb-6 italic">
                Example: "I [mask] to school" or "She [mask] the book"
              </p>

              <button
                className="bg-gradient-to-r from-green-600 to-lime-700 hover:from-green-500 hover:to-lime-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex items-center justify-center font-medium text-lg hover:scale-105 transform"
                onClick={handlePredict}
                disabled={isLoading || !inputText.includes("[mask]")}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Predicting...
                  </span>
                ) : (
                  <>
                    <span className="text-2xl mr-3">🕵️‍♂️</span>
                    Get Suggestions
                  </>
                )}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-slate-800/70 via-green-900/30 to-lime-900/50 backdrop-blur-xl rounded-2xl border border-green-700/30 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-200 to-lime-200 bg-clip-text text-transparent flex items-center mb-6">
                  Suggestions
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {suggestions.map((word, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm border-lime-400 bg-gradient-to-br from-green-900/40 to-lime-800/30 hover:border-lime-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-tamil text-lime-50 leading-relaxed flex-1 text-lg">{inputText.replace("[mask]", word)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-lg font-medium text-sm border bg-lime-800/50 text-lime-200 border-lime-600/30">
                          Suggestion
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-slate-800/70 via-green-900/30 to-lime-900/50 backdrop-blur-xl border border-green-700/30 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-green-500/20 sticky top-6">
              <h2 className="text-xl font-bold mb-6 text-lime-100 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-2xl">🕵️‍♂️</span>
                </div>
                Examples
              </h2>
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="border border-lime-600/30 rounded-xl p-4 cursor-pointer hover:bg-lime-800/20 transition-all duration-300 hover:shadow-lg hover:border-lime-500/50 hover:scale-105 transform"
                    onClick={() => handleExampleClick(example)}
                  >
                    <p className="font-tamil text-lime-50 leading-relaxed">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/70 via-green-900/30 to-lime-900/50 backdrop-blur-xl border border-green-700/30 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-green-500/20">
              <h2 className="text-xl font-bold mb-6 text-lime-100 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-2xl">🕵️‍♂️</span>
                </div>
                Recent Searches
              </h2>
              {recentSearches.length > 0 ? (
                <ul className="space-y-3 text-lime-200 text-sm">
                  {recentSearches.map((search, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-slate-700/30 hover:bg-lime-800/30 transition-all duration-300 rounded-lg px-4 py-3 border border-lime-600/20"
                    >
                      <span
                        className="cursor-pointer hover:text-lime-300 transition flex-1 mr-3"
                        onClick={() => setInputText(search)}
                      >
                        {search.length > 30 ? `${search.slice(0, 30)}...` : search}
                      </span>
                      <button
                        className="text-red-400 hover:text-red-300 transition text-sm p-1 rounded hover:bg-red-900/20"
                        onClick={() => setRecentSearches(recentSearches.filter((_, i) => i !== index))}
                        title="Delete this search"
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lime-300/70">No recent searches.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-800/70 via-green-900/30 to-lime-900/50 backdrop-blur-xl border border-green-700/30 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-green-500/20">
              <h2 className="text-xl font-bold mb-6 text-lime-100 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-2xl">🕵️‍♂️</span>
                </div>
                Tips for Using
              </h2>
              <ul className="space-y-3 text-lime-200 text-sm">
                <li className="flex items-center p-2 rounded-lg bg-lime-800/20">
                  Enter a sentence with [mask] to get suggestions.
                </li>
                <li className="flex items-center p-2 rounded-lg bg-green-800/20">
                  Click on examples to auto-fill the input.
                </li>
                <li className="flex items-center p-2 rounded-lg bg-yellow-800/20">
                  Suggestions are context-aware and may vary.
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-800/70 via-green-900/30 to-lime-900/50 backdrop-blur-xl border border-green-700/30 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-green-500/20">
              <h2 className="text-xl font-bold mb-6 text-lime-100 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-2xl">🕵️‍♂️</span>
                </div>
                Feedback
              </h2>
              <textarea
                className="w-full bg-slate-800/70 border border-lime-600/30 text-lime-50 rounded-xl p-4 text-sm shadow-inner backdrop-blur-sm placeholder-lime-300/50 focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300 h-40 resize-none"
                placeholder="Share your feedback..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <button
                className="mt-6 bg-gradient-to-r from-green-600 to-lime-700 hover:from-green-500 hover:to-lime-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 flex items-center justify-center font-medium text-lg hover:scale-105 transform"
                onClick={handleFeedbackSubmit}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-12 py-8 text-center text-lime-200/70 text-sm border-t border-green-700/30 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <span className="text-lime-400 mr-2 text-xl">🕵️‍♂️</span>
                <span>Masking Predict &copy; 2025</span>
              </div>
              <span className="hidden md:inline">|</span>
              <div>Created by Group-23</div>
            </div>
            <p className="mt-3 text-lime-300/70 text-xs">Powered by context-aware AI</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
