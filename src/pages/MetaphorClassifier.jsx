import React, { useState, useMemo,useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { FiCopy } from "react-icons/fi";
import { AiOutlineCheck } from "react-icons/ai";

export default function MetaphorClassifier() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');
  const [filterConfidence, setFilterConfidence] = useState([0, 1]);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(''); // for keyword search
  const [copyStatus, setCopyStatus] = useState(false); // for copy feedback
  const [recentSearches, setRecentSearches] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const pdfRef = useRef();
  
  const pageSize = 5;

  const examples = [
    {
      text: "அந்த பெண்ணின் கண்கள் நட்சத்திரங்கள் போல மின்னின.",
      label: "Metaphor (Likely)",
      description: "Eyes compared to stars"
    },
    {
      text: "அவர் நேற்று சாப்பிட்டார்.",
      label: "Literal (Likely)",
      description: "Simple statement of fact"
    },
    {
      text: "காலம் ஒரு ஆறு போல ஓடுகிறது.",
      label: "Metaphor (Likely)",
      description: "Time compared to a river"
    },
    {
      text: "அவரது வார்த்தைகள் என் இதயத்தை துளைத்தன.",
      label: "Metaphor (Likely)",
      description: "Words described as piercing the heart"
    }
  ];
  const funFacts = [
  "காலம் ஒரு ஆறு போல ஓடுகிறது. (Time flows like a river.)",
  "அந்த பெண்ணின் கண்கள் நட்சத்திரங்கள் போல மின்னின. (Her eyes sparkled like stars.)",
  "Words are the dress of thoughts."
];
const submitFeedback = (feedback) => {
  if (!feedback.trim()) {
    toast.error("Please enter your feedback before submitting.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return;
  }

  console.log("Feedback submitted:", feedback);
  toast.success("Thank you for your feedback!", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
   const handleExampleClick = (example) => {
    setInputText(example.text);
  };

  // Helper to split Tamil text into sentences (handles newlines and punctuation)
  function splitSentences(text) {
    // Split by newline, then by Tamil/English sentence-ending punctuation
    return text
      .split('\n')
      .flatMap(line =>
        line
          .split(/(?<=[\.!?।]|[.!?])\s+/)
          .map(s => s.trim())
          .filter(Boolean)
      );
  }

  const handleAnalyzeClick = async () => {
    if (!inputText.trim()) {
      setError('Please enter some Tamil text to analyze');
      return;
    }
    setRecentSearches((prevSearches) => {
    const updatedSearches = [inputText, ...prevSearches.filter(search => search !== inputText)];
    return updatedSearches.slice(0, 5); // Limit to 5 recent searches
  });

    setIsLoading(true);
    setError('');
    setResults([]);
    setStats(null);

    try {
      // Split input into sentences
      const sentences = splitSentences(inputText);

      // Analyze each sentence (parallel requests)
      const promises = sentences.map(sentence =>
        axios.post('http://localhost:5000/api/predict', { text: sentence })
          .then(response => {
            // Normalize response
            if (response.data.results) {
              return response.data.results[0];
            } else if (typeof response.data.is_metaphor !== "undefined") {
              return {
                text: sentence,
                label: response.data.is_metaphor ? "Metaphor" : "Literal",
                confidence: response.data.confidence
              };
            } else {
              return {
                text: sentence,
                label: "Unknown",
                confidence: 0
              };
            }
          })
          .catch(() => ({
            text: sentence,
            label: "Error",
            confidence: 0
          }))
      );

      const allResults = await Promise.all(promises);

      // Compute stats
      const metaphorCount = allResults.filter(r => r.label === "Metaphor").length;
      const literalCount = allResults.filter(r => r.label === "Literal").length;
      const avgConfidence = allResults.length
        ? allResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / allResults.length
        : 0;
      const highConfidenceCount = allResults.filter(r => (r.confidence || 0) > 0.85).length;

      setResults(allResults);
      setStats({
        total_sentences: allResults.length,
        metaphor_count: metaphorCount,
        literal_count: literalCount,
        average_confidence: avgConfidence,
        high_confidence_count: highConfidenceCount
      });
    } catch (error) {
      setError('Failed to analyze text. Please try again or check if the server is running.');
      
      // Fallback demo results for testing UI when server is not available
      if (inputText.includes('கண்') || inputText.includes('eyes')) {
        const demoResults = [
          {
            text: inputText,
            label: "Metaphor",
            confidence: 0.92
          }
        ];
        setResults(demoResults);
        setStats({
          total_sentences: 1,
          metaphor_count: 1,
          literal_count: 0,
          average_confidence: 0.92,
          high_confidence_count: 1
        });
      } else {
        const sentences = inputText.split('\n').filter(s => s.trim());
        const demoResults = sentences.map(sentence => ({
          text: sentence,
          label: Math.random() > 0.5 ? "Metaphor" : "Literal",
          confidence: 0.7 + Math.random() * 0.25
        }));
        
        const metaphorCount = demoResults.filter(r => r.label === "Metaphor").length;
        setResults(demoResults);
        setStats({
          total_sentences: sentences.length,
          metaphor_count: metaphorCount,
          literal_count: sentences.length - metaphorCount,
          average_confidence: 0.85,
          high_confidence_count: Math.floor(sentences.length * 0.7)
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering logic
 // Filtering logic
const filteredResults = results.filter(r => {
  const labelMatch =
    filterLabel === 'all' ||
    (filterLabel === 'metaphor' && r.label === 'Metaphor') ||
    (filterLabel === 'literal' && r.label === 'Literal');
  const conf = r.confidence || 0;
  const confMatch = conf >= filterConfidence[0] && conf <= filterConfidence[1];
  const searchMatch = r.text.toLowerCase().includes(searchKeyword.toLowerCase()); // Check if the text includes the search keyword
  return labelMatch && confMatch && searchMatch;
});
const searchAnalytics = useMemo(() => {
  const totalSearches = recentSearches.length;
  const uniqueSearches = new Set(recentSearches).size;

  // Count frequency of each search
  const searchFrequency = recentSearches.reduce((acc, search) => {
    acc[search] = (acc[search] || 0) + 1;
    return acc;
  }, {});

  // Sort searches by frequency
  const mostSearched = Object.entries(searchFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 most searched phrases

  return { totalSearches, uniqueSearches, mostSearched };
}, [recentSearches]);
  // Pagination logic


  // Table sorting
  const [sortCol, setSortCol] = useState('index');
  const [sortDir, setSortDir] = useState('asc');
  // Sorting logic
// Sorting logic
const sortedResults = useMemo(() => {
  let arr = [...filteredResults];

  if (sortCol === 'confidence') {
    // Sort by confidence
    arr.sort((a, b) =>
      sortDir === 'asc'
        ? (a.confidence || 0) - (b.confidence || 0)
        : (b.confidence || 0) - (a.confidence || 0)
    );
  } else if (sortCol === 'label') {
    // Sort by label
    arr.sort((a, b) =>
      sortDir === 'asc'
        ? a.label.localeCompare(b.label)
        : b.label.localeCompare(a.label)
    );
  }

  return arr;
}, [filteredResults, sortCol, sortDir]);

// Pagination logic
const totalPages = Math.max(1, Math.ceil(sortedResults.length / pageSize)); // Use sortedResults for total pages
const pagedResults = useMemo(() => {
  const start = (page - 1) * pageSize;
  return sortedResults.slice(start, start + pageSize); // Use sortedResults for pagination
}, [sortedResults, page, pageSize]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      {/* Header with subtle gradient and shadow */}
      <ToastContainer />
      <header className="bg-gradient-to-r from-amber-900 to-amber-700 text-white p-6 shadow-lg">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Tamil Metaphor <span className="text-amber-300">Classifier</span>
            </h1>
            <Link to="/" className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg transition-colors border border-white/10 shadow-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto p-6 space-y-8">
        {error && (
          <div className="bg-red-900/80 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded-lg backdrop-blur-sm animate-pulse">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Input Section with glassy effect */}
          <div className="lg:col-span-3">

            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-amber-900/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  Enter Tamil Text
                </h2>
                {isLoading && (
                  <span className="text-xs bg-amber-800/30 text-amber-300 px-2 py-1 rounded-full animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
              <textarea
                className="w-full border border-gray-600 bg-gray-700/70 text-white rounded-lg p-4 h-80 font-tamil focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Enter Tamil text to analyze for metaphors..."
              />
              <p className="text-xs text-gray-400 mt-2 mb-4 italic">
                You can enter multiple lines of text. Each line will be analyzed separately.
              </p>
              
              <button
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center font-medium"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Analyze Text
                  </>
                )}
              </button>
            </div>
            
           {/* Enhanced Filter & Controls Panel */}
{results.length > 0 && (
  <div className="mb-6 p-5 bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-xl">
    
    <div className="flex flex-wrap gap-6 items-center justify-between">
      
      {/* Filter by Label */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">Filter by Label</label>
        <select
          className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-1.5 shadow-inner focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={filterLabel}
          onChange={e => setFilterLabel(e.target.value)}
        >
          <option value="all">All Labels</option>
          <option value="metaphor">Metaphor Only</option>
          <option value="literal">Literal Only</option>
        </select>
      </div>

      {/* Confidence Range Filter */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">Confidence Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={0} max={1} step={0.01}
            value={filterConfidence[0]}
            onChange={e => setFilterConfidence([parseFloat(e.target.value), filterConfidence[1]])}
            className="bg-gray-800 border border-gray-600 text-white rounded-md px-2 py-1.5 w-16 shadow-inner"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            min={0} max={1} step={0.01}
            value={filterConfidence[1]}
            onChange={e => setFilterConfidence([filterConfidence[0], parseFloat(e.target.value)])}
            className="bg-gray-800 border border-gray-600 text-white rounded-md px-2 py-1.5 w-16 shadow-inner"
          />
        </div>
      </div>

      {/* Search by Keyword */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">Search</label>
        <input
          type="text"
          placeholder="Search sentences..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-1.5 shadow-inner w-40 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">Sort By</label>
        <div className="flex bg-gray-800 rounded-md p-1 shadow-inner">
          <button
            className={`px-3 py-1 rounded-md text-sm ${sortCol === 'confidence' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => { setSortCol('confidence'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
          >
            Confidence
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${sortCol === 'label' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => { setSortCol('label'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
          >
            Label
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">View Mode</label>
        <div className="flex bg-gray-800 rounded-md p-1 shadow-inner">
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'card' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setViewMode('card')}
          >
            Card
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'table' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300 font-medium">Page</label>
        <div className="flex items-center space-x-2">
          <button
            className="bg-gray-800 border border-gray-600 text-white rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ◀
          </button>
          <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
          <button
            className="bg-gray-800 border border-gray-600 text-white rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ▶
          </button>
        </div>
      </div>
      
    </div>

    {/* Filter Summary & Reset/Copy */}
    <div className="mt-4 pt-3 border-t border-gray-700 flex flex-wrap justify-between items-center gap-3">
      <div className="text-xs text-gray-400">
        Showing <span className="font-medium text-amber-400">{pagedResults.length}</span> of <span className="font-medium text-white">{filteredResults.length}</span> sentences
        {filteredResults.length < results.length && (<span> (filtered from {results.length} total)</span>)}
      </div>

      <div className="flex gap-2">
        {filteredResults.length > 0 && (
          <>
            <button
              className="text-xs bg-amber-700/50 hover:bg-amber-700/70 text-amber-200 px-2 py-1 rounded flex items-center transition-colors"
              onClick={() => {
                setFilterLabel('all');
                setFilterConfidence([0, 1]);
                setSearchKeyword('');
                setPage(1);
              }}
            >
              Reset Filters
            </button>

            <button
  className="text-xs bg-green-700/50 hover:bg-green-700/70 text-green-200 px-2 py-1 rounded flex items-center transition-colors"
  onClick={() => {
    // Copy only the filtered results
    const textToCopy = filteredResults.map(r => r.text).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 1500); // Reset copy status after 1.5 seconds
  }}
>
  {copyStatus ? (
      <AiOutlineCheck className="text-green-400 text-lg" />
    ) : (
      <FiCopy className="text-gray-400 hover:text-amber-400 text-lg" />
    )}
    <span>{copyStatus ? "Copied All" : "Copy All "}</span>
</button>
          </>
        )}
      </div>
    </div>

  </div>
)}

            {/* Card View */}
{viewMode === 'card' && Array.isArray(pagedResults) && pagedResults.length > 0 && (
  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-amber-900/40">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-amber-400 flex items-center">
        Analysis Results
      </h2>
      <div className="text-xs text-gray-400 flex space-x-2">
        <span className="bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded">{stats.metaphor_count} Metaphors</span>
        <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">{stats.literal_count} Literal</span>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      
      {pagedResults.map((result, index) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(result.text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500); // show tick for 1.5s
  };

  return (
    <div
      key={index}
      className={`border-l-4 p-4 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg 
        ${result.label === 'Metaphor' 
          ? 'border-amber-500 bg-gradient-to-r from-amber-900/30 to-gray-800/50' 
          : 'border-gray-500 bg-gray-800/50'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-tamil text-lg text-gray-100 leading-relaxed flex-1">{result.text}</p>
        <button
          onClick={handleCopy}
          className="ml-3 text-gray-400 hover:text-amber-400 transition-colors flex items-center"
          title="Copy sentence"
        >
          {copiedIndex === index ? (<AiOutlineCheck className="text-green-400 text-lg" />
) : (
  <FiCopy className="text-gray-400 hover:text-amber-400 text-lg" />)}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-0.5 rounded font-medium text-xs ${result.label === 'Metaphor' ? 'bg-amber-900/50 text-amber-300' : 'bg-gray-600/50 text-gray-300'}`}>
            {result.label}
          </span>

          <div className="flex items-center space-x-2">
            <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full ${
                  result.label === 'Literal'
                    ? (100 - result.confidence * 100) > 70
                      ? 'bg-red-500'
                      : (100 - result.confidence * 100) > 40
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    : result.confidence > 0.7
                      ? 'bg-green-500'
                      : result.confidence > 0.4
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                }`}
                style={{
                  width: `${
                    result.label === 'Literal'
                      ? (100 - result.confidence * 100)
                      : (result.confidence * 100)
                  }%`
                }}
              ></div>
            </div>
            <span className="text-sm text-gray-300">
              {result.label === 'Literal'
                ? (100 - (result.confidence * 100)).toFixed(1) + '%'
                : (result.confidence * 100).toFixed(1) + '%'}
            </span>
          </div>
        </div>

        {/* {result.label === 'Metaphor' && (
          <span className="bg-amber-900/60 text-amber-200 text-xs px-2 py-1 rounded-full border border-amber-700/50">
            உருவகம்
          </span>
        )} */}
      </div>
    </div>
  );
})}
    </div>
  </div>
)}

{/* Table View */}
{viewMode === 'table' && Array.isArray(sortedResults) && sortedResults.length > 0 && (
  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-6 overflow-x-auto transition-all duration-300 hover:shadow-amber-900/40">
    <h2 className="text-2xl font-bold mb-4 text-amber-400 flex items-center">
      Tabular View
    </h2>

    <table className="min-w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-800 text-gray-300 border-b border-gray-700">
          <th className="px-4 py-3 text-left">#</th>
          <th className="px-4 py-3 text-left">Sentence</th>
          <th className="px-4 py-3 text-left">Label</th>
          <th className="px-4 py-3 text-left">Confidence</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {sortedResults.slice((page-1)*pageSize, page*pageSize).map((result, idx) => {
          

          const globalIndex = (page - 1) * pageSize + idx;

const handleCopy = () => {
  navigator.clipboard.writeText(result.text);
  setCopiedIndex(globalIndex);
  setTimeout(() => setCopiedIndex(null), 1500);
};

          return (
            <tr key={idx} className={`${result.label === 'Metaphor' ? 'bg-amber-900/20 hover:bg-amber-900/30' : 'hover:bg-gray-800/50'} transition-colors`}>
              <td className="px-4 py-3 font-medium">{(page-1)*pageSize + idx + 1}</td>
              <td className="px-4 py-3 font-tamil text-gray-100 flex justify-between items-center">
                <span>{result.text}</span>
                <button onClick={handleCopy} className="ml-2 text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  {copiedIndex === globalIndex? (
    <AiOutlineCheck className="text-green-400 text-lg" />
  ) : (
    <FiCopy className="text-gray-400 hover:text-amber-400 text-lg" />
  )}
                </button>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${result.label === 'Metaphor' ? 'bg-amber-900/70 text-amber-200' : 'bg-gray-600 text-gray-300'}`}>
                  {result.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
  <div
    className={`h-3 rounded-full ${
      result.label === 'Literal'
        ? (100 - result.confidence * 100) > 70
          ? 'bg-red-500'
          : (100 - result.confidence * 100) > 40
            ? 'bg-yellow-500'
            : 'bg-green-500'
        : result.confidence > 0.7
          ? 'bg-green-500'
          : result.confidence > 0.4
            ? 'bg-yellow-500'
            : 'bg-red-500'
    }`}
    style={{
      width: `${
        result.label === 'Literal'
          ? (100 - result.confidence * 100)
          : (result.confidence * 100)
      }%`
    }}
  ></div>
</div>
                  {/* <span className="text-gray-300">{(result.confidence * 100).toFixed(1)}%</span>
                   */}
                   <span className="text-sm text-gray-300">
  {result.label === 'Literal'
    ? (100 - (result.confidence * 100)).toFixed(1) + '%'
    : (result.confidence * 100).toFixed(1) + '%'}
</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}
            {/* Stats Section with enhanced styling */}
{stats && (
  <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-amber-900/30 mt-8">
    <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-between">
      <span className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
        Analysis Dashboard
      </span>
      <span className="text-sm text-gray-400">Updated {new Date().toLocaleDateString()}</span>
    </h2>

    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-800/30 hover:scale-105 transition">
          <div className="text-3xl font-bold text-amber-300">{stats.metaphor_count}</div>
          <div className="text-xs text-amber-200/70">Metaphors</div>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30 hover:scale-105 transition">
          <div className="text-3xl font-bold text-gray-300">{stats.literal_count}</div>
          <div className="text-xs text-gray-400">Literal</div>
        </div>
        <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/30 hover:scale-105 transition">
          <div className="text-3xl font-bold text-indigo-300">{stats.total_sentences}</div>
          <div className="text-xs text-indigo-200/70">Total Sentences</div>
        </div>
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-800/30 hover:scale-105 transition">
          <div className="text-3xl font-bold text-green-300">{(stats.average_confidence * 100).toFixed(1)}%</div>
          <div className="text-xs text-green-200/70">Avg. Confidence</div>
        </div>
      </div>

      {/* Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
  {/* radar chart */}
  <div className="flex flex-col">
    <h3 className="font-medium text-gray-300 mb-3">Overall Profile (Radar)</h3>
    <div className="flex-1 h-[500px]">
      <Plot
        data={[
          {
            type: 'scatterpolar',
            r: [
              stats.metaphor_count,
              stats.literal_count,
              stats.total_sentences,
              (stats.average_confidence * 100).toFixed(1)
            ],
            theta: ['Metaphor', 'Literal', 'Total', 'Confidence'],
            fill: 'toself',
            line: { color: '#f59e0b' }
          }
        ]}
        layout={{
          polar: {
            radialaxis: { visible: true, range: [0, Math.max(stats.total_sentences, 100)] }
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#f59e0b' }
        }}
        config={{ displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  </div>

  {/* pie chart */}
  <div className="flex flex-col">
    <h3 className="font-medium text-gray-300 mb-3">Metaphor vs Literal Distribution</h3>
    <div className="flex-1 h-[500px]">
      <Plot
        data={[
          {
            type: 'pie',
            values: [stats.metaphor_count, stats.literal_count],
            labels: ['Metaphor', 'Literal'],
            marker: { colors: ['#f59e0b', '#6b7280'] },
            hole: 0.4
          }
        ]}
        layout={{
          margin: { t: 10, r: 0, l: 0, b: 0 },
          showlegend: true,
          legend: { font: { color: '#e5e7eb' } },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)'
        }}
        config={{ displayModeBar: false }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  </div>
</div>


      {/* Confidence bar */}
      {/* <div>
        <h3 className="font-medium text-gray-300 mb-3">Confidence per Sentence</h3>
        <div className="h-56">
          <Plot
            data={[
              {
                type: 'bar',
                x: results.map((r, i) => `S${i + 1}`),
                y: results.map(r => Math.round((r.confidence || 0) * 100)),
                marker: { color: results.map(r => r.label === "Metaphor" ? '#f59e0b' : '#6b7280') }
              }
            ]}
            layout={{
              margin: { t: 20, r: 0, l: 40, b: 40 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e5e7eb' },
              xaxis: { title: 'Sentence', tickangle: -45 },
              yaxis: { title: 'Confidence (%)', range: [0, 100] }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div> */}

      {/* NEW: Trend line */}
      {/* <div>
        <h3 className="font-medium text-gray-300 mb-3">Confidence Trend (Line Chart)</h3>
        <div className="h-56">
          <Plot
            data={[
              {
                type: 'scatter',
                mode: 'lines+markers',
                x: results.map((r, i) => i + 1),
                y: results.map(r => Math.round((r.confidence || 0) * 100)),
                line: { color: '#10b981' }
              }
            ]}
            layout={{
              margin: { t: 20, r: 0, l: 40, b: 40 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#e5e7eb' },
              xaxis: { title: 'Sentence Index' },
              yaxis: { title: 'Confidence (%)', range: [0, 100] }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div> */}

      
      

     
      {/* NEW: Radar chart for overall profile */}



{/* <div>
  <h3 className="font-medium text-gray-300 mb-3">Confidence Distribution by Label</h3>
  <div className="h-56">
    <Plot
      data={[
        {
          type: 'box',
          y: results.filter(r => r.label === 'Metaphor').map(r => Math.round((r.confidence || 0) * 100)),
          name: 'Metaphor',
          marker: { color: '#f59e0b' }
        },
        {
          type: 'box',
          y: results.filter(r => r.label === 'Literal').map(r => Math.round((r.confidence || 0) * 100)),
          name: 'Literal',
          marker: { color: '#6b7280' }
        }
      ]}
      layout={{
        margin: { t: 20, r: 0, l: 40, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e5e7eb' },
        yaxis: { title: 'Confidence (%)', range: [0, 100] }
      }}
      config={{ displayModeBar: false }}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div> */}
{/* <div>
  <h3 className="font-medium text-gray-300 mb-3">Confidence vs Sentence Length</h3>
  <div className="h-56">
    <Plot
      data={[
        {
          type: 'scatter',
          mode: 'markers',
          x: results.map(r => r.text.length), // Sentence length
          y: results.map(r => Math.round((r.confidence || 0) * 100)), // Confidence
          marker: { color: '#6366f1', size: 8 }
        }
      ]}
      layout={{
        margin: { t: 20, r: 0, l: 40, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e5e7eb' },
        xaxis: { title: 'Sentence Length' },
        yaxis: { title: 'Confidence (%)', range: [0, 100] }
      }}
      config={{ displayModeBar: false }}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div> */}
{/* <div>
  <h3 className="font-medium text-gray-300 mb-3">Label Distribution Over Confidence Ranges</h3>
  <div className="h-56">
    <Plot
      data={[
        {
          type: 'bar',
          x: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
          y: [
            results.filter(r => r.label === 'Metaphor' && r.confidence <= 0.2).length,
            results.filter(r => r.label === 'Metaphor' && r.confidence > 0.2 && r.confidence <= 0.4).length,
            results.filter(r => r.label === 'Metaphor' && r.confidence > 0.4 && r.confidence <= 0.6).length,
            results.filter(r => r.label === 'Metaphor' && r.confidence > 0.6 && r.confidence <= 0.8).length,
            results.filter(r => r.label === 'Metaphor' && r.confidence > 0.8).length
          ],
          name: 'Metaphor',
          marker: { color: '#f59e0b' }
        },
        {
          type: 'bar',
          x: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
          y: [
            results.filter(r => r.label === 'Literal' && r.confidence <= 0.2).length,
            results.filter(r => r.label === 'Literal' && r.confidence > 0.2 && r.confidence <= 0.4).length,
            results.filter(r => r.label === 'Literal' && r.confidence > 0.4 && r.confidence <= 0.6).length,
            results.filter(r => r.label === 'Literal' && r.confidence > 0.6 && r.confidence <= 0.8).length,
            results.filter(r => r.label === 'Literal' && r.confidence > 0.8).length
          ],
          name: 'Literal',
          marker: { color: '#6b7280' }
        }
      ]}
      layout={{
        barmode: 'stack',
        margin: { t: 20, r: 0, l: 40, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e5e7eb' },
        xaxis: { title: 'Confidence Range' },
        yaxis: { title: 'Count' }
      }}
      config={{ displayModeBar: false }}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div>
<div>
  <h3 className="font-medium text-gray-300 mb-3">Sentence Count by Label</h3>
  <div className="h-56">
    <Plot
      data={[
        {
          type: 'bar',
          x: ['Metaphor', 'Literal'],
          y: [stats.metaphor_count, stats.literal_count],
          marker: { color: ['#f59e0b', '#6b7280'] }
        }
      ]}
      layout={{
        margin: { t: 20, r: 0, l: 40, b: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e5e7eb' },
        xaxis: { title: 'Label' },
        yaxis: { title: 'Count' }
      }}
      config={{ displayModeBar: false }}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div> */}

{/* Explanatory Analysis */}
{/* Explanatory Analysis Table */}
<div className="my-6">
  <h3 className="text-2xl font-bold text-white mb-5 border-b border-gray-600 pb-2">explanatory analysis</h3>

  <div className="overflow-x-auto rounded-2xl shadow-lg bg-gray-900/80">
    <table className="min-w-full text-left text-gray-200 text-sm">
      <thead className="bg-gray-800/90">
        <tr>
          <th className="px-6 py-3">Metric</th>
          <th className="px-6 py-3">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-700 hover:bg-gray-800/70 transition">
          <td className="px-6 py-4">Total Sentences</td>
          <td className="px-6 py-4 font-semibold text-indigo-400">{stats.total_sentences}</td>
        </tr>
        <tr className="border-b border-gray-700 hover:bg-gray-800/70 transition">
          <td className="px-6 py-4">Metaphors</td>
          <td className="px-6 py-4 font-semibold text-purple-400">{stats.metaphor_count}</td>
        </tr>
        <tr className="border-b border-gray-700 hover:bg-gray-800/70 transition">
          <td className="px-6 py-4">Literal Sentences</td>
          <td className="px-6 py-4 font-semibold text-green-400">{stats.literal_count}</td>
        </tr>
        <tr className="border-b border-gray-700 hover:bg-gray-800/70 transition">
          <td className="px-6 py-4">Average Confidence</td>
          <td className="px-6 py-4 font-semibold text-yellow-400">{(stats.average_confidence * 100).toFixed(1)}%</td>
        </tr>
        <tr className="hover:bg-gray-800/70 transition">
          <td className="px-6 py-4">High Confidence Sentences (&gt;85%)</td>
          <td className="px-6 py-4 font-semibold text-red-400">{stats.high_confidence_count}</td>
        </tr>
      </tbody>
    </table>
    <p className="text-gray-400 text-xs mt-3 px-6 pb-4">
      these stats complement the charts above, giving a quick overview of sentence distribution and confidence levels.
    </p>
  </div>
  
</div>






{/* NEW: Export Data */}
<div className="flex justify-end mt-4">
  <button
    onClick={() => {
      const csv = results
        .map((r, i) => `S${i + 1},${r.label},${(r.confidence * 100).toFixed(1)}`)
        .join('\n')
      const blob = new Blob([`Sentence,Label,Confidence\n${csv}`], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "analysis.csv"
      link.click()
    }}
    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
  >
    Export CSV
  </button>
</div>
<div className="flex justify-end mt-4">
  {/* <button
    // onClick={handleExportPDF}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
  >
    Export PDF
  </button> */}
</div>

    </div>
  </div>
)}


          
        {/* Sidebar with enhanced styling */}
          
          
        </div>
        <div className="lg:col-span-1 space-y-8">
            {/* Examples Section */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 002-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Examples
              </h2>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div 
                    key={index}
                    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/70 transition-all hover:shadow-md hover:border-amber-800/50"
                    onClick={() => handleExampleClick(example)}
                  >
                    <p className="font-tamil text-white">{example.text}</p>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        example.label.includes('Metaphor') ? 'bg-amber-900/70 text-amber-200' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {example.label}
                      </span>
                      <span className="text-gray-400 text-xs">{example.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
    Quick Summary
  </h2>
  {stats ? (
    <ul className="space-y-2 text-gray-300 text-sm">
      <li>Total Sentences: <span className="font-bold text-indigo-400">{stats.total_sentences}</span></li>
      <li>Metaphors: <span className="font-bold text-purple-400">{stats.metaphor_count}</span></li>
      <li>Literals: <span className="font-bold text-green-400">{stats.literal_count}</span></li>
      <li>Avg. Confidence: <span className="font-bold text-yellow-400">{(stats.average_confidence * 100).toFixed(1)}%</span></li>
    </ul>
  ) : (
    <p className="text-gray-400">No analysis data available.</p>
  )}
</div>




<div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zM3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM2 11a2 2 0 002-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
    Recent Searches
  </h2>
  {recentSearches.length > 0 ? (
    <>
      <ul className="space-y-2 text-gray-300 text-sm">
        {recentSearches.map((search, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-gray-700/50 hover:bg-gray-700/70 transition-colors rounded-md px-3 py-2"
          >
            <span
              className="cursor-pointer hover:text-amber-400 transition"
              onClick={() => setInputText(search)} // Populate input field on click
            >
              {search.length > 30 ? `${search.slice(0, 30)}...` : search}
            </span>
            <button
              className="text-red-400 hover:text-red-500 transition text-xs"
              onClick={() => {
                setRecentSearches(recentSearches.filter((_, i) => i !== index));
              }}
              title="Delete this search"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition"
        onClick={() => {
          Swal.fire({
            title: 'Are you sure?',
            text: "This will clear all recent searches!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear all!',
            cancelButtonText: 'Cancel',
          }).then((result) => {
            if (result.isConfirmed) {
              setRecentSearches([]); // Clear all recent searches
              Swal.fire(
                'Cleared!',
                'All recent searches have been cleared.',
                'success'
              );
            }
          });
        }}
      >
        Clear All
      </button>
    </>
  ) : (
    <p className="text-gray-400">No recent searches.</p>
  )}
</div>
<div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zM3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM2 11a2 2 0 002-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
    Search Analytics
  </h2>
  <ul className="space-y-2 text-gray-300 text-sm">
    <li>Total Searches: <span className="font-bold text-indigo-400">{searchAnalytics.totalSearches}</span></li>
    <li>Unique Searches: <span className="font-bold text-green-400">{searchAnalytics.uniqueSearches}</span></li>
    <li>Most Searched Phrases:</li>
    <ul className="ml-4 space-y-1">
      {searchAnalytics.mostSearched.map(([phrase, count], index) => (
        <li key={index} className="flex justify-between">
          <span>{phrase.length > 30 ? `${phrase.slice(0, 30)}...` : phrase}</span>
          <span className="text-amber-400">{count} times</span>
        </li>
      ))}
    </ul>
  </ul>
</div>
<div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13 7H7v6h6V7z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
    Tips for Using
  </h2>
  <ul className="space-y-2 text-gray-300 text-sm">
    <li>Enter one or more Tamil sentences for analysis.</li>
    <li>Use filters to narrow down results by label or confidence.</li>
    <li>Click "Copy All" to copy filtered results to your clipboard.</li>
    <li>Switch between "Card" and "Table" views for different layouts.</li>
  </ul>
</div>


<div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M18 13a1 1 0 01-1 1H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 12H17a1 1 0 011 1z" />
    </svg>
    Feedback
  </h2>
  <textarea
    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 text-sm"
    placeholder="Share your feedback..."
    rows={10}
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
  />
  <button
    className="mt-3 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg"
    onClick={() => submitFeedback(feedback)}
  >
    Submit Feedback
  </button>
</div>


{/* <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-amber-900/20">
  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2H7v-2h2V7h2v2h2v2h-2v2z" />
    </svg>
    Fun Fact
  </h2>
  <p className="text-gray-300 italic">{funFacts[Math.floor(Math.random() * funFacts.length)]}</p>
</div> */}
            
          </div>
      </div>
      
      <footer className="border-t border-gray-700 mt-8 bg-gradient-to-r from-gray-900 to-gray-800">
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Main footer content */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Logo and copyright */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-bold text-amber-400">Tamil Metaphor Classifier</h3>
        <p className="text-sm text-gray-400">
          Identify metaphors in Tamil text using advanced NLP techniques.
        </p>
        <p className="text-xs text-gray-500">
          &copy; 2025 | Created by Group-23
          <span className="ml-2 px-2 py-1 bg-gray-800 rounded text-gray-400 text-xs">v1.2.0</span>
        </p>
      </div>

      {/* Quick links */}
      <div className="flex flex-col space-y-4">
        <h4 className="text-base font-medium text-white">Quick Links</h4>
        <nav className="flex flex-col space-y-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors">About</Link>
          <a href="https://github.com/username/repo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-amber-400 transition-colors">GitHub Repository</a>
          <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">Documentation</a>
          <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">API Reference</a>
        </nav>
      </div>

      {/* Contact & Options */}
      <div className="flex flex-col space-y-4">
        <h4 className="text-base font-medium text-white">Connect</h4>
        <div className="flex space-x-4">
          <a href="https://github.com/username" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
          <a href="https://twitter.com/username" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.036 10.036 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
          <a href="mailto:contact@example.com" aria-label="Email" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>
          <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language selector */}
          <select className="bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 px-2 py-1">
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
          </select>
          
          {/* Theme toggle */}
          <button 
            className="bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 px-2 py-1 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark Mode
          </button>
          
          {/* Scroll to top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-amber-600 text-white text-xs rounded px-2 py-1 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Top
          </button>
        </div>
      </div>
    </div>
    
    {/* Bottom bar */}
    <div className="border-t border-gray-800 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
      <div className="flex space-x-4 mb-4 md:mb-0">
        <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
      </div>
      <div>
        <span>Application responsibly trained on data from Tamil literature and scholarly resources.</span>
      </div>
    </div>
  </div>
</footer>
    </div>
    </div>
  );
}
