import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';

export default function MetaphorClassifier() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleExampleClick = (example) => {
    setInputText(example.text);
  };

  const handleAnalyzeClick = async () => {
    if (!inputText.trim()) {
      setError('Please enter some Tamil text to analyze');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);
    setStats(null);

    try {
      const response = await axios.post('http://localhost:5000/api/predict', {
        text: inputText
      });

      setResults(response.data.results);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error analyzing text:', error);
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-amber-800 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tamil Metaphor Classifier</h1>
            <Link to="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-white">Enter Tamil Text</h2>
              <textarea
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-3 h-40 font-tamil"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Enter Tamil text to analyze for metaphors..."
              />
              <p className="text-xs text-gray-400 mt-1 mb-4">
                You can enter multiple lines of text. Each line will be analyzed separately.
              </p>
              
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
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
                  'Analyze Text'
                )}
              </button>
            </div>
            
            {/* Results Section */}
            {results.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Analysis Results</h2>
                
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`border-l-4 ${
                        result.label === 'Metaphor' ? 'border-amber-500 bg-gray-700' : 'border-gray-500 bg-gray-700'
                      } p-4 rounded-lg`}
                    >
                      <p className="font-tamil text-lg mb-2 text-white">{result.text}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            result.label === 'Metaphor' ? 'text-amber-400' : 'text-gray-300'
                          }`}>
                            {result.label}
                          </span>
                          <span className="mx-2 text-gray-500">|</span>
                          <span className="text-sm text-gray-400">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        {result.label === 'Metaphor' && (
                          <span className="bg-amber-900 text-amber-200 text-xs px-2 py-1 rounded-full">
                            உருவகம்
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Examples Section */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-white">Examples</h2>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div 
                    key={index}
                    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleExampleClick(example)}
                  >
                    <p className="font-tamil text-white">{example.text}</p>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className={`font-medium ${
                        example.label.includes('Metaphor') ? 'text-amber-400' : 'text-gray-300'
                      }`}>
                        {example.label}
                      </span>
                      <span className="text-gray-400 text-xs">{example.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats Section */}
            {stats && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Statistics</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Sentences:</span>
                    <span className="font-medium text-white">{stats.total_sentences}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-400">Metaphors:</span>
                      <span className="font-medium text-amber-400">{stats.metaphor_count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${(stats.metaphor_count / stats.total_sentences) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Literal:</span>
                      <span className="font-medium text-gray-300">{stats.literal_count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-gray-500 h-2.5 rounded-full" 
                        style={{ width: `${(stats.literal_count / stats.total_sentences) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Average Confidence:</span>
                    <span className="font-medium text-white">{(stats.average_confidence * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="font-medium text-gray-300 mb-2">Distribution</h3>
                    <div className="h-48 w-full">
                      {stats && (
                        <Plot
                          data={[
                            {
                              type: 'pie',
                              values: [stats.metaphor_count, stats.literal_count],
                              labels: ['Metaphor', 'Literal'],
                              marker: {
                                colors: ['#f59e0b', '#6b7280']
                              },
                              hole: 0.4
                            }
                          ]}
                          layout={{
                            margin: { t: 0, r: 0, l: 0, b: 0 },
                            showlegend: false,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            autosize: true,
                            font: { color: '#e5e7eb' }
                          }}
                          config={{ displayModeBar: false }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-700 mt-8">
        <p>Tamil Metaphor Classifier &copy; 2025 | Created by Vinushaanth</p>
      </footer>
    </div>
  );
}
