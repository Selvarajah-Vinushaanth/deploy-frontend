import React, { useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MetaphorCreator() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [style, setStyle] = useState("poetic");
  const [generatedMetaphors, setGeneratedMetaphors] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const handleGenerateMetaphors = async () => {
    if (!source.trim() || !target.trim()) {
      setError("Please fill both source and target words.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      // Call backend API endpoint
      const response = await axios.post(
        "http://localhost:5000/api/create-metaphors",
        {
          source,
          target,
          style,
        }
      );

      // Process the response
      if (response.data && response.data.metaphors) {
        setGeneratedMetaphors(response.data.metaphors);
        setHistory([{ source, target, style, results: response.data.metaphors }, ...history]);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error generating metaphors:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate metaphors. Please try again."
      );

      // Fallback to client-side generation if API fails
      const fallbackExamples = [
        `${source} is like a shining ${target}`,
        `${target} holds the soul of a ${source}`,
        `a ${source} reborn inside an ${target}`,
      ];
      setGeneratedMetaphors(fallbackExamples);
      setHistory([{ source, target, style, results: fallbackExamples }, ...history]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = generatedMetaphors.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (m) => {
    if (favorites.includes(m)) {
      setFavorites(favorites.filter((f) => f !== m));
    } else {
      setFavorites([...favorites, m]);
    }
  };

  // Add this new function to handle example clicks
  const handleExampleClick = (source, target) => {
    setSource(source);
    setTarget(target);
    // Optional: Scroll to the input fields for better UX
    document.querySelector('input[placeholder*="source"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Chart Data Helpers
  function getStyleChartData() {
    const styleCounts = {};
    history.forEach(h => {
      styleCounts[h.style] = (styleCounts[h.style] || 0) + 1;
    });
    return {
      labels: Object.keys(styleCounts),
      datasets: [{
        data: Object.values(styleCounts),
        backgroundColor: ["#fbbf24", "#f59e42", "#f472b6", "#34d399", "#60a5fa"],
      }],
    };
  }

  function getSourceChartData() {
    const sourceCounts = {};
    history.forEach(h => {
      sourceCounts[h.source] = (sourceCounts[h.source] || 0) + 1;
    });
    const sorted = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: "Sources",
        data: sorted.map(([_, v]) => v),
        backgroundColor: "#fbbf24",
      }],
    };
  }

  function getTargetChartData() {
    const targetCounts = {};
    history.forEach(h => {
      targetCounts[h.target] = (targetCounts[h.target] || 0) + 1;
    });
    const sorted = Object.entries(targetCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: "Targets",
        data: sorted.map(([_, v]) => v),
        backgroundColor: "#f59e42",
      }],
    };
  }

  function getFavoritesChartData() {
    // Count by style for favorites
    const styleCounts = {};
    favorites.forEach(f => {
      const h = history.find(h => h.results.includes(f));
      if (h) {
        styleCounts[h.style] = (styleCounts[h.style] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(styleCounts),
      datasets: [{
        data: Object.values(styleCounts),
        backgroundColor: ["#fbbf24", "#f59e42", "#f472b6", "#34d399", "#60a5fa"],
      }],
    };
  }

  // Export/Share Helpers
  function exportMetaphors(type) {
    let content = "";
    let filename = "metaphors." + type;
    if (type === "txt") {
      content = generatedMetaphors.join("\n");
    } else if (type === "csv") {
      content = "Metaphor\n" + generatedMetaphors.map(m => `"${m.replace(/"/g, '""')}"`).join("\n");
    } else if (type === "json") {
      content = JSON.stringify(generatedMetaphors, null, 2);
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function shareMetaphors() {
    const text = generatedMetaphors.join("\n");
    if (navigator.share) {
      navigator.share({
        title: "My Metaphors",
        text,
      });
    } else {
      copyToClipboard();
      alert("Metaphors copied! Paste them to share on social media.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 relative">
      {/* Header with gradient and shadow */}
      <header className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white p-6 shadow-lg">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Metaphor{" "}
              <span className="text-amber-200">Creator</span>
            </h1>
            <Link
              to="/"
              className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg transition-colors border border-white/10 shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Main Content */}
        <div className="w-full md:w-3/4 p-6 md:p-10 order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl p-8 space-y-6 backdrop-blur-sm mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Create New Metaphor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  placeholder="Enter source (ex: pearl)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-amber-500 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target
                </label>
                <input
                  type="text"
                  placeholder="Enter target (ex: eye)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-amber-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-end">
              <div className="w-full md:w-60">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all duration-200"
                >
                  <option value="poetic">✨ Poetic</option>
                  <option value="short">⚡ Short</option>
                  <option value="romantic">💖 Romantic</option>
                  <option value="philosophical">🧠 Philosophical</option>
                  <option value="humorous">😄 Humorous</option>
                </select>
              </div>

              <motion.button
                onClick={handleGenerateMetaphors}
                disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg text-white font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg w-full md:w-auto"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
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
                    Generating...
                  </div>
                ) : (
                  "Generate Metaphors"
                )}
              </motion.button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm mb-6">
                {error}
              </div>
            )}
          </motion.div>

          {generatedMetaphors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl p-8 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-amber-400"
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
                  Generated Metaphors
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-200 transition-colors duration-200 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
                {/* Export/Share Buttons */}
                <div className="flex gap-2 ml-4">
                  <button onClick={() => exportMetaphors('txt')} className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-amber-600">Export TXT</button>
                  <button onClick={() => exportMetaphors('csv')} className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-amber-600">Export CSV</button>
                  <button onClick={() => exportMetaphors('json')} className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-amber-600">Export JSON</button>
                  {/* <button onClick={shareMetaphors} className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-amber-600">Share</button> */}
                </div>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-6 space-y-4">
                {generatedMetaphors.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <p className="text-gray-200 font-medium">{m}</p>
                    <button
                      onClick={() => toggleFavorite(m)}
                      className={`ml-4 p-2 rounded-full transition-all duration-200 ${
                        favorites.includes(m)
                          ? "bg-amber-600/20 text-amber-400"
                          : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                      }`}
                      title={
                        favorites.includes(m)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      {favorites.includes(m) ? "★" : "☆"}
                    </button>
                  </motion.div>
                ))}
              </div>
              {/* Visualization Section */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-2 text-amber-300">Metaphor Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/70 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-300">Style Distribution</h4>
                    <Pie data={getStyleChartData()} />
                  </div>
                  <div className="bg-gray-900/70 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-300">Most Used Sources</h4>
                    <Bar data={getSourceChartData()} />
                  </div>
                  <div className="bg-gray-900/70 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-300">Most Used Targets</h4>
                    <Bar data={getTargetChartData()} />
                  </div>
                </div>
                {favorites.length > 0 && (
                  <div className="mt-6 bg-gray-900/70 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-300">Favorites Breakdown</h4>
                    <Pie data={getFavoritesChartData()} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4 px-6 py-8 bg-gray-900/90 border-l border-gray-800 order-1 md:order-2 md:overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300 text-center">
            Inspiration & History
          </h3>

          <div className="space-y-6">
            {/* Example Pairs */}
            <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 shadow">
              <h4 className="font-semibold mb-3 flex items-center text-amber-300">
                <span className="mr-2">🌟</span> Example Pairs
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("முத்து", "கண்")}
                >
                  <div className="font-medium text-amber-400">முத்து</div>
                  <div className="text-gray-400">கண்</div>
                </div>
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("தீ", "ஆர்வம்")}
                >
                  <div className="font-medium text-amber-400">தீ</div>
                  <div className="text-gray-400">ஆர்வம்</div>
                </div>
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("சந்திரன்", "கனவு")}
                >
                  <div className="font-medium text-amber-400">சந்திரன்</div>
                  <div className="text-gray-400">கனவு</div>
                </div>
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("மரம்", "மனம்")}
                >
                  <div className="font-medium text-amber-400">மரம்</div>
                  <div className="text-gray-400">மனம்</div>
                </div>
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("நட்சத்திரம்", "ஒளி")}
                >
                  <div className="font-medium text-amber-400">நட்சத்திரம்</div>
                  <div className="text-gray-400">ஒளி</div>
                </div>
                <div 
                  className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-amber-500/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleExampleClick("கடல்", "நிழல்")}
                >
                  <div className="font-medium text-amber-400">கடல்</div>
                  <div className="text-gray-400">நிழல்</div>
                </div>
              </div>
            </div>

            {/* Tabs for History and Favorites */}
            <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 shadow">
              <div className="flex border-b border-gray-800 mb-4">
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === "history"
                      ? "text-amber-400 border-b-2 border-amber-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === "favorites"
                      ? "text-amber-400 border-b-2 border-amber-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("favorites")}
                >
                  Favorites
                </button>
              </div>

              {activeTab === "history" && (
                <>
                  {history.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 text-center">
                      No history yet. Generate your first metaphor!
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-1">
                      {history.map((h, i) => (
                        <li
                          key={i}
                          className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setSource(h.source);
                            setTarget(h.target);
                            setStyle(h.style);
                          }}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-amber-400">
                              {h.source} → {h.target}
                            </span>
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                              {h.style}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {h.results[0]}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "favorites" && (
                <>
                  {favorites.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-800/30 p-4 rounded-lg border border-gray-800/50 text-center">
                      No favorites yet. Click the star icon to save a metaphor!
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-1">
                      {favorites.map((f, i) => (
                        <li
                          key={i}
                          className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 group"
                        >
                          <div className="flex justify-between items-center">
                            <p className="text-gray-200">{f}</p>
                            <button
                              onClick={() => toggleFavorite(f)}
                              className="opacity-0 group-hover:opacity-100 text-amber-400 hover:text-amber-300 transition-opacity duration-200"
                              title="Remove from favorites"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center mt-6">
            Click any example to use it as your source and target!
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-gray-400 text-sm border-t border-gray-800/70 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>Metaphor Creator &copy; 2023</span>
            </div>
            <span className="hidden md:inline">|</span>
            <div>Create beautiful metaphors with AI</div>
          </div>
          <p className="mt-3 text-gray-500 text-xs">
            Powered by creative language processing
          </p>

          <div className="mt-6 flex justify-center space-x-4">
            <button className="text-gray-500 hover:text-amber-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-amber-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.037 10.037 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-amber-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
