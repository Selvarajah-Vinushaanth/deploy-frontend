import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function LyricGenerator() {
  const [theme, setTheme] = useState('love');
  const [style, setStyle] = useState('modern');
  const [length, setLength] = useState('medium');
  const [seed, setSeed] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const themes = [
    { value: 'love', label: 'Love / காதல்' },
    { value: 'nature', label: 'Nature / இயற்கை' },
    { value: 'friendship', label: 'Friendship / நட்பு' },
    { value: 'devotion', label: 'Devotion / பக்தி' },
    { value: 'patriotic', label: 'Patriotic / தேசபக்தி' }
  ];

  const styles = [
    { value: 'modern', label: 'Modern' },
    { value: 'classical', label: 'Classical' },
    { value: 'folk', label: 'Folk / நாட்டுப்புற' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'philosophical', label: 'Philosophical' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (4 lines)' },
    { value: 'medium', label: 'Medium (8 lines)' },
    { value: 'long', label: 'Long (12+ lines)' }
  ];

  const handleGenerateLyrics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/generate-lyrics', {
        theme,
        style,
        length,
        seed
      });

      setGeneratedLyrics(response.data.lyrics);
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setError('Failed to generate lyrics. Please try again.');
      
      // For demo/fallback
      if (theme === 'love') {
        setGeneratedLyrics(
          "உன் கண்கள் நட்சத்திரங்கள் போல மின்னுகின்றன\n" +
          "உன் புன்னகை சூரியனைப் போல ஒளிரும்\n" +
          "உன் குரல் இசையைப் போல் இனிமையானது\n" +
          "உன் அன்பு கடலைப் போல் ஆழமானது\n\n" +
          "நான் உன்னைப் பார்க்கும் ஒவ்வொரு முறையும்\n" +
          "என் இதயம் துடிப்பது வேகமாகிறது\n" +
          "உன்னோடு இருக்கும் ஒவ்வொரு நொடியும்\n" +
          "என் வாழ்க்கை நிறைவடைகிறது"
        );
      } else if (theme === 'nature') {
        setGeneratedLyrics(
          "மரங்கள் காற்றில் ஆடுகின்றன\n" +
          "பறவைகள் வானத்தில் பறக்கின்றன\n" +
          "நதிகள் கடலை நோக்கி ஓடுகின்றன\n" +
          "பூக்கள் மணம் வீசுகின்றன\n\n" +
          "இயற்கை தன் அழகை காட்டுகிறது\n" +
          "மனிதன் அதை ரசிக்கிறான்\n" +
          "இயற்கை தன் வளங்களை வழங்குகிறது\n" +
          "மனிதன் அதை அழிக்கிறான்"
        );
      } else {
        setGeneratedLyrics(
          "உண்மையான நட்பு என்பது அரிதானது\n" +
          "உண்மையான நண்பன் என்பது அருமையானவன்\n" +
          "கஷ்டத்தில் உதவும் கரங்கள்\n" +
          "மகிழ்ச்சியில் பகிர்ந்து கொள்ளும் மனம்\n\n" +
          "பொருள் இல்லாத போதும் பிரியாத நட்பு\n" +
          "அருகில் இல்லாத போதும் மறக்காத நட்பு\n" +
          "தூரத்தில் இருந்தாலும் நெருக்கமான நட்பு\n" +
          "காலம் மாறினாலும் மாறாத நட்பு"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-indigo-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tamil Lyric Generator</h1>
            <Link to="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Generate Tamil Lyrics</h2>
            
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
                <select
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  {themes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Style</label>
                <select
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {styles.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Length</label>
                <select
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  {lengths.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Seed Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Starting Line (Optional)
                </label>
                <textarea
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-3 h-20 font-tamil"
                  placeholder="Enter a starting line for your lyrics (optional)..."
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Leave blank for completely new lyrics, or enter a starting line to build from.
                </p>
              </div>
              
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center mt-4"
                onClick={handleGenerateLyrics}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Lyrics'
                )}
              </button>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Generated Lyrics</h2>
            
            {generatedLyrics ? (
              <div className="bg-gray-700 border-gray-600 p-4 rounded-lg min-h-[300px] font-tamil relative">
                <pre className="whitespace-pre-wrap text-lg leading-relaxed text-gray-100">
                  {generatedLyrics}
                </pre>
                
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    className="bg-gray-600 hover:bg-gray-500 p-2 rounded-full"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLyrics);
                      alert("Lyrics copied to clipboard!");
                    }}
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-700 border-gray-600 p-4 rounded-lg min-h-[300px] flex items-center justify-center text-gray-400">
                <p>Generated lyrics will appear here</p>
              </div>
            )}
            
            {generatedLyrics && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => {
                    setSeed(generatedLyrics.split('\n')[0]);
                    setGeneratedLyrics('');
                  }}
                >
                  Use First Line As Seed
                </button>
                <button
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm"
                  onClick={handleGenerateLyrics}
                >
                  Generate Another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-700 mt-8">
        <p>Tamil Lyric Generator &copy; 2025 | Created by Vinushaanth</p>
      </footer>
    </div>
  );
}
