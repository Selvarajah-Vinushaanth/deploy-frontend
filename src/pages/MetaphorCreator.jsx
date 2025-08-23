import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MetaphorCreator() {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [emotion, setEmotion] = useState('positive');
  const [createdMetaphors, setCreatedMetaphors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const emotions = [
    { value: 'positive', label: 'Positive / நேர்மறை' },
    { value: 'negative', label: 'Negative / எதிர்மறை' },
    { value: 'neutral', label: 'Neutral / நடுநிலை' }
  ];

  const exampleSources = [
    { label: 'Moon / நிலவு', source: 'நிலவு', target: 'முகம்' },
    { label: 'Ocean / கடல்', source: 'கடல்', target: 'கண்கள்' },
    { label: 'Fire / நெருப்பு', source: 'நெருப்பு', target: 'காதல்' },
    { label: 'Tree / மரம்', source: 'மரம்', target: 'வாழ்க்கை' },
    { label: 'Wind / காற்று', source: 'காற்று', target: 'சுதந்திரம்' }
  ];

  const handleCreateMetaphors = async () => {
    if (!source.trim() || !target.trim()) {
      setError('Please provide both source and target domains');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/create-metaphors', {
        source,
        target,
        emotion
      });

      setCreatedMetaphors(response.data.metaphors);
    } catch (error) {
      console.error('Error creating metaphors:', error);
      setError('Failed to create metaphors. Please try again.');
      
      // For demo/fallback
      let demoMetaphors = [];
      
      if (source.includes('நிலவு') || source.includes('moon')) {
        demoMetaphors = [
          `${target} ஒரு ${source} போல ஒளிர்கிறது`,
          `${target} ${source}வைப் போல அழகானது`,
          `${source}வைப் போன்ற ${target}, இரவின் இருளை விரட்டுகிறது`,
          `${target} ${source}வைப் போல மாறிக்கொண்டே இருக்கிறது`,
          `${source} போல, ${target} தூரத்திலிருந்தும் கவர்ச்சிகரமானது`
        ];
      } else if (source.includes('கடல்') || source.includes('ocean')) {
        demoMetaphors = [
          `${target} ${source} போல ஆழமானது`,
          `${source}லைப் போல ${target} எப்போதும் அலைபாய்கிறது`,
          `${target} ${source}லைப் போல விசாலமானது`,
          `${source}லைப் போன்ற ${target}, ஆற்றல் நிறைந்தது`,
          `${target} ஒரு ${source}, பல ரகசியங்களை உள்ளடக்கியது`
        ];
      } else {
        demoMetaphors = [
          `${target} ஒரு ${source} போன்றது`,
          `${source} போல, ${target} எப்போதும் மாறிக்கொண்டே இருக்கிறது`,
          `${target} ${source}வைப் போல வலிமையானது`,
          `${source}வைப் போன்ற ${target}, மனதை கொள்ளை கொள்கிறது`,
          `${target} ஒரு ${source}, உணர்வுகளை தட்டி எழுப்புகிறது`
        ];
      }
      
      setCreatedMetaphors(demoMetaphors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setSource(example.source);
    setTarget(example.target);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-purple-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tamil Metaphor Creator</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-1 bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Create Metaphors</h2>
            
            <div className="space-y-4">
              {/* Source Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Source Domain (உருவகிக்கும் பொருள்)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2 font-tamil"
                  placeholder="E.g., நிலவு (moon)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  The thing you want to compare from (source of comparison)
                </p>
              </div>
              
              {/* Target Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Domain (உருவகிக்கப்படும் பொருள்)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2 font-tamil"
                  placeholder="E.g., முகம் (face)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  The thing you want to compare to (target of comparison)
                </p>
              </div>
              
              {/* Emotion */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Emotion Tone</label>
                <select
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-2"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                >
                  {emotions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center mt-4"
                onClick={handleCreateMetaphors}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Metaphors'
                )}
              </button>
            </div>
            
            {/* Examples */}
            <div className="mt-6">
              <h3 className="font-medium text-sm text-gray-300 mb-2">Examples</h3>
              <div className="space-y-2">
                {exampleSources.map((example, index) => (
                  <button
                    key={index}
                    className="block w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-sm transition-colors"
                    onClick={() => handleExampleClick(example)}
                  >
                    <span className="font-medium">{example.label}</span>
                    <span className="text-gray-400 text-xs block">
                      Source: {example.source}, Target: {example.target}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="md:col-span-2 bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Generated Metaphors</h2>
            
            {createdMetaphors.length > 0 ? (
              <div className="space-y-4">
                {createdMetaphors.map((metaphor, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 border-gray-600 p-4 rounded-lg relative group"
                  >
                    <p className="text-lg font-tamil text-gray-100">{metaphor}</p>
                    
                    <button
                      className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        navigator.clipboard.writeText(metaphor);
                        alert("Metaphor copied to clipboard!");
                      }}
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-700 border-gray-600 p-6 rounded-lg min-h-[300px] flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <p className="text-center">Enter source and target domains to generate metaphors</p>
                <p className="text-center text-sm mt-2">Example: Source = "நிலவு" (Moon), Target = "முகம்" (Face)</p>
              </div>
            )}
            
            {createdMetaphors.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors text-white text-sm"
                  onClick={handleCreateMetaphors}
                >
                  Generate More Metaphors
                </button>
              </div>
            )}
            
            {/* Explanation */}
            <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h3 className="font-medium text-gray-200 mb-2">About Metaphors</h3>
              <p className="text-sm text-gray-300">
                A metaphor is a figure of speech that directly compares one thing to another for rhetorical effect. 
                Tamil literature is rich with metaphors that compare abstract concepts to concrete objects, creating 
                vivid imagery and emotional impact.
              </p>
              <p className="text-sm text-gray-300 mt-2">
                In metaphor creation, the <span className="font-medium">source domain</span> is what you're comparing from, 
                and the <span className="font-medium">target domain</span> is what you're comparing to.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-700 mt-8">
        <p>Tamil Metaphor Creator &copy; 2025 | Created by Vinushaanth</p>
      </footer>
    </div>
  );
}
