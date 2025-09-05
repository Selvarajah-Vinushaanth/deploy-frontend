import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function LyricGenerator() {
  const [motion, setMotion] = useState('calm');
  const [seed, setSeed] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedLyric, setSelectedLyric] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', or 'focus'

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [moodUsage, setMoodUsage] = useState({
  'அமைதி': 0,        // calm
  'சந்தோஷம்': 0,      // happy
  'கவலை': 0,         // sad
  'காதல்': 0,         // romantic
  'உற்சாகம்': 0       // energetic
});
  const [showAnalytics, setShowAnalytics] = useState(false);

  const motions = [
    { value: 'அமைதி', label: 'Calm / அமைதி', color: 'bg-blue-600', icon: '🌊' },
    { value: 'சந்தோஷம்', label: 'Happy / சந்தோஷம்', color: 'bg-yellow-500', icon: '😊' },
    { value: 'கவலை', label: 'Sad / கவலை', color: 'bg-purple-600', icon: '😢' },
    { value: 'காதல்', label: 'Romantic / காதல்', color: 'bg-pink-500', icon: '💖' },
    { value: 'உற்சாகம்', label: 'Energetic / உற்சாகம்', color: 'bg-red-500', icon: '⚡' }
  ];
  
  useEffect(() => {
    // Reset copied state when lyrics change
    setCopied(false);
    
    // Parse lyrics into sentences when generatedLyrics changes
    if (generatedLyrics) {
      // Check if generatedLyrics is already an array
      if (Array.isArray(generatedLyrics)) {
        setParsedLyrics(generatedLyrics);
        setSelectedLyric(0);
      } else {
        // If it's a string, split it as before
        const sentences = generatedLyrics
          .split('.')
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .map(sentence => sentence.endsWith('.') ? sentence : sentence + '.');
        
        setParsedLyrics(sentences);
        setSelectedLyric(0);
      }
    } else {
      setParsedLyrics([]);
    }
  }, [generatedLyrics]);

  // Add recent searches to the state and update when generating lyrics
  useEffect(() => {
    if (generatedLyrics && seed) {
      setRecentSearches((prev) => {
        const updatedSearches = [seed, ...prev];
        return updatedSearches.slice(0, 5); // Keep only the last 5 searches
      });
    }
  }, [generatedLyrics]);

  const handleGenerateLyrics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/generate-lyrics', {
        motion,
        seed
      });

      // Check if response.data.lyrics is an array or a string and set accordingly
      if (response.data && response.data.lyrics) {
        setGeneratedLyrics(response.data.lyrics);
        
        // Track mood usage - ADD THIS
        setMoodUsage(prev => ({
          ...prev,
          [motion]: prev[motion] + 1
        }));
      } else {
        // Fallback in case of unexpected response format
        setGeneratedLyrics(seed ? seed : "இங்கே உங்கள் பாடல் வரிகள் தோன்றும்...");
      }
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setError('Failed to generate lyrics. Please try again.');
      setGeneratedLyrics(seed ? seed : "இங்கே உங்கள் பாடல் வரிகள் தோன்றும்...");
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text = null) => {
    const textToCopy = text || generatedLyrics;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
const lyricExamples = [
  {
    mood: 'அமைதி',
    text: 'காற்று மெதுவாக வீசுகிறது, மனம் அமைதியாக இருக்கிறது.',
    label: 'Calm Example'
  },
  {
    mood: 'சந்தோஷம்',
    text: 'இன்று என் மனதில் மகிழ்ச்சி பொங்குகிறது.',
    label: 'Happy Example'
  },
  {
    mood: 'கவலை',
    text: 'மழை பொழிகிறது, என் மனதில் கவலை.',
    label: 'Sad Example'
  },
  {
    mood: 'காதல்',
    text: 'உன் கண்கள் என் கனவுகளின் வெளிச்சம்.',
    label: 'Romantic Example'
  },
  {
    mood: 'உற்சாகம்',
    text: 'வானம் கதிர்கள் வீசும், உற்சாகம் நிரம்பும்.',
    label: 'Energetic Example'
  }
];

const handleExampleClick = (example) => {
  setSeed(example.text);
  setMotion(example.mood);
};

  // Add delete functionality for individual and all recent searches
const handleDeleteSearch = (index) => {
  setRecentSearches((prev) => prev.filter((_, i) => i !== index));
};

const handleDeleteAllSearches = () => {
  setShowConfirmation(true);
};

const confirmDeleteAll = () => {
  setRecentSearches([]);
  setShowConfirmation(false);
};

const cancelDeleteAll = () => {
  setShowConfirmation(false);
};
const downloadGeneratedLyrics = () => {
    if (!generatedLyrics || parsedLyrics.length === 0) {
      alert('No lyrics generated to download. Please generate lyrics first.');
      return;
    }

    // Create content with motion, seed, and all generated lyrics
    const content = [
      `Tamil Lyric Generator Results`,
      `========================`,
      ``,
      `Emotion/Motion: ${motion}`,
      `Initial Seed: ${seed || 'None'}`,
      `Generated on: ${new Date().toLocaleString()}`,
      ``,
      `Generated Lyrics:`,
      `================`,
      ``,
      ...parsedLyrics.map((lyric, index) => `${index + 1}. ${lyric}`),
      ``,
      `--`,
      `Generated by Tamil Lyric Generator - Group-23`
    ].join('\n');

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tamil_lyrics_${motion}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 relative">
      {/* Header with gradient and shadow */}
      <header className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white p-6 shadow-lg">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Tamil Lyric <span className="text-indigo-300">Generator</span>
            </h1>
            <Link to="/" className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg transition-colors border border-white/10 shadow-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="flex w-full min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-900/40 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded backdrop-blur-sm">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl p-8 space-y-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Generate Tamil Lyrics
          </h2>

          {/* Motion Cards */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Mood</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {motions.map((option) => (
                <button
                  key={option.value}
                  className={`${option.color} ${motion === option.value ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'} rounded-lg p-3 transition-all shadow-md text-center text-white`}
                  onClick={() => setMotion(option.value)}
                >
                  <div className="font-medium text-sm">{option.label.split(' / ')[0]}</div>
                  <div className="text-xs mt-1 font-tamil">{option.label.split(' / ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seed Text */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Initial Sentence (Optional)
            </label>
            <textarea
              className="w-full border border-gray-600/70 bg-gray-700/50 text-white rounded-lg p-4 h-40 font-tamil focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-inner"
              placeholder="Enter an initial sentence..."
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button
            className={`w-full ${isLoading ? 'bg-gray-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white px-6 py-4 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2 font-medium`}
            onClick={handleGenerateLyrics}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Generate Lyrics</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-3 md:space-y-0 md:space-x-8">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Generated Lyrics
            </h2>
            
            {generatedLyrics && (
              <div className="flex space-x-3">
                {/* View Mode Toggles */}
                <div className="flex bg-gray-700/50 rounded-lg p-1 mr-2">
                  <button 
                    onClick={() => handleViewModeChange('cards')}
                    className={`py-1 px-3 rounded ${viewMode === 'cards' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('list')}
                    className={`py-1 px-3 rounded ${viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('focus')}
                    className={`py-1 px-3 rounded ${viewMode === 'focus' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                </div>
                
                <button 
                  onClick={() => copyToClipboard()}
                  className="text-gray-300 hover:text-white flex items-center space-x-1 py-1 px-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all"
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                      </svg>
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                {/* Download Generated Lyrics Button */}
                  <button
                    onClick={downloadGeneratedLyrics}
                    className="text-gray-300 hover:text-white flex items-center space-x-1 py-1 px-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Download</span>
                  </button>
              </div>
            )}
          </div>
          
          {/* Different View Modes for Lyrics */}
          {generatedLyrics ? (
            <>
              {/* Cards View */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {parsedLyrics.map((lyric, index) => (
                    <div 
                      key={index}
                      className={`rounded-lg p-5 transition-all cursor-pointer transform hover:scale-105 ${
                        index === selectedLyric 
                          ? 'bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-2 border-indigo-500 shadow-lg shadow-indigo-500/30' 
                          : 'bg-gray-900/60 border border-gray-700/50 hover:border-indigo-500/50'
                      }`}
                      onClick={() => setSelectedLyric(index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="rounded-full bg-gray-800/80 w-7 h-7 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(lyric);
                          }}
                          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg font-tamil leading-relaxed mt-3">{lyric}</p>
                      
                      <div className="mt-4 pt-3 border-t border-gray-700/30 flex justify-between">
                        <div className="text-xs text-gray-400">{motion}</div>
                        <div className="text-xs text-gray-400">
                          {motions.find(m => m.value === motion)?.icon || '🎵'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3 bg-gray-900/60 rounded-lg p-5 border border-gray-700/50">
                  {parsedLyrics.map((lyric, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg flex items-start space-x-3 transition-all ${
                        index === selectedLyric 
                          ? 'bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border border-indigo-500/70' 
                          : 'bg-gray-800/60 border border-gray-700/30 hover:border-indigo-500/30'
                      }`}
                      onClick={() => setSelectedLyric(index)}
                    >
                      <div className="rounded-full bg-gray-700/70 w-7 h-7 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="text-lg font-tamil leading-relaxed">{lyric}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(lyric);
                        }}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Focus View */}
              {viewMode === 'focus' && parsedLyrics.length > 0 && (
                <div className="bg-gray-900/60 rounded-lg border border-gray-700/50 overflow-hidden">
                  <div className="flex justify-between items-center bg-gray-800/80 px-5 py-3 border-b border-gray-700/30">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setSelectedLyric(prev => Math.max(0, prev - 1))}
                        disabled={selectedLyric === 0}
                        className={`p-1 rounded-full mr-2 ${selectedLyric === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="text-sm">
                        Lyric {selectedLyric + 1} of {parsedLyrics.length}
                      </span>
                      <button 
                        onClick={() => setSelectedLyric(prev => Math.min(parsedLyrics.length - 1, prev + 1))}
                        disabled={selectedLyric === parsedLyrics.length - 1}
                        className={`p-1 rounded-full ml-2 ${selectedLyric === parsedLyrics.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-xs mr-3 px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
                        {motions.find(m => m.value === motion)?.icon || '🎵'} {motion}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(parsedLyrics[selectedLyric])}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-10 flex flex-col items-center justify-center min-h-[200px]">
                    <div className="flex mb-6">
                      <div className="text-4xl text-indigo-300 opacity-50">"</div>
                    </div>
                    <p className="text-2xl text-center font-tamil leading-relaxed max-w-2xl">
                      {parsedLyrics[selectedLyric]}
                    </p>
                    <div className="flex justify-end w-full mt-6">
                      <div className="text-4xl text-indigo-300 opacity-50">"</div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 border-t border-gray-700/30 bg-gray-800/30 flex justify-center">
                    {parsedLyrics.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedLyric(index)}
                        className={`w-2 h-2 mx-1 rounded-full ${
                          index === selectedLyric 
                            ? 'bg-indigo-500' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to lyric ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="min-h-[300px] rounded-lg bg-gray-900/60 p-6 border border-gray-700/50 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-center">Generated lyrics will appear here</p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Select a mood, optionally provide an initial sentence, and click "Generate Lyrics" to create beautiful Tamil lyrics
              </p>
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-xl p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zM3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM2 11a2 2 0 002-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Recent Searches
              </h2>
              <button
                onClick={handleDeleteAllSearches}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Delete All
              </button>
            </div>
            <ul className="space-y-2">
              {recentSearches.map((search, index) => (
                <li
                  key={index}
                  className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center hover:bg-gray-600/50 transition-all"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => setSeed(search)}
                  >
                    {search}
                  </span>
                  <button
                    onClick={() => handleDeleteSearch(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-96 text-center">
              <h3 className="text-lg font-bold text-white mb-4">Confirm Delete All</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete all recent searches?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDeleteAll}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={cancelDeleteAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Toggle Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{showAnalytics ? 'Hide Analytics' : 'Show Mood Analytics'}</span>
          </button>
        </div>

        {/* Mood Distribution Chart */}
        {showAnalytics && (
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl p-8 backdrop-blur-sm mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Mood Usage Distribution
              </h2>
              <button 
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center">
              <div className="bg-gray-900/60 rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4 text-center text-gray-200">Your Generation Preferences</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
  data={Object.entries(moodUsage).map(([mood, count]) => ({
    name: motions.find(m => m.value === mood)?.label.split(' / ')[0] || mood,
    value: count,
    icon: motions.find(m => m.value === mood)?.icon || '🎵'
  }))}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={({name, percent, value}) => value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
  outerRadius={100}
  fill="#8884d8"
  dataKey="value"
>
  {Object.entries(moodUsage).map((entry, index) => (
    <Cell key={`cell-${index}`} fill={['#3B82F6', '#EAB308', '#8B5CF6', '#EC4899', '#EF4444'][index]} />
  ))}
</Pie>

                    <Tooltip 
                      formatter={(value, name) => [`${value} generations`, name]}
                      contentStyle={{
  backgroundColor: '#ffffff',     // white card
  border: '1px solid #E5E7EB',    // light gray border
  borderRadius: '8px',
  color: '#111827',                // dark text
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)' // subtle shadow for depth
}}

                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-lg p-3 text-center border border-blue-500/30">
                    <div className="text-xl font-bold text-blue-400">
                      {Object.values(moodUsage).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="text-xs text-gray-300">Total</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-lg p-3 text-center border border-purple-500/30">
                    <div className="text-xl font-bold text-purple-400">
{Object.entries(moodUsage).reduce(
  (maxEntry, [mood, count]) =>
    count > maxEntry[1] ? [mood, count] : maxEntry,
  ['calm', 0]
)[0]}

                    </div>
                    <div className="text-xs text-gray-300">Favorite</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-600/20 to-pink-800/20 rounded-lg p-3 text-center border border-pink-500/30">
                    <div className="text-xl font-bold text-pink-400">
                      {parsedLyrics.length}
                    </div>
                    <div className="text-xs text-gray-300">Current</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Right Sidebar for Examples */}
{/* Right Sidebar */}
<aside className="w-1/4 px-6 bg-gray-900/90 border-l border-gray-800 rounded-l-2xl shadow-xl overflow-y-auto">
  <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300 text-center">
    Lyric Examples
  </h3>

  <div className="space-y-4">
    {lyricExamples.map((example, idx) => (
      <div
        key={idx}
        className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 cursor-pointer hover:border-indigo-500 transition-all shadow hover:shadow-indigo-500/20"
        onClick={() => handleExampleClick(example)}
      >
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">
            {motions.find(m => m.value === example.mood)?.icon || '🎵'}
          </span>
          <span className="font-semibold">{example.label}</span>
        </div>
        <p className="font-tamil text-gray-200">{example.text}</p>
      </div>
    ))}
  </div>

  {/* Download / Export Button */}
  {/* <button
    className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    onClick={() => {
      const text = lyricExamples.map(ex => `${ex.label}: ${ex.text}`).join("\n\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lyric_examples.txt";
      a.click();
      URL.revokeObjectURL(url);
    }}
  >
    📥 Download All
  </button> */}

  <div className="mt-4 text-xs text-gray-400 text-center">
    Click an example to use it as your seed!
  </div>
</aside>




      
    </div>
    <footer className="mt-12 py-8 text-center text-gray-400 text-sm border-t border-gray-800/70 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6 space-y-4 md:space-y-0 md:space-x-8">
            {motions.map(motion => (
              <div key={motion.value} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${motion.color}`}></div>
                <span className="text-xs">{motion.label}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
              </svg>
              <span>Tamil Lyric Generator &copy; 2025</span>
            </div>
            <span className="hidden md:inline">|</span>
            <div>Created by Group-23</div>
          </div>
          <p className="mt-3 text-gray-500 text-xs">Powered by natural language processing</p>
          
          <div className="mt-6 flex justify-center space-x-4">
            <button className="text-gray-500 hover:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="text-gray-500 hover:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.037 10.037 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"/>
              </svg>
            </button>
            <button className="text-gray-500 hover:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
    
  );
}

