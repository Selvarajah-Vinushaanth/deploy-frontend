import React, { useState } from 'react';

export default function ResultsSection({ results }) {
  const [expanded, setExpanded] = useState({});
  const [sortBy, setSortBy] = useState('index'); // index, confidence, label
  const [sortDir, setSortDir] = useState('asc');
  const [detailView, setDetailView] = useState(false);
  
  const toggleExpand = (idx) => {
    setExpanded({...expanded, [idx]: !expanded[idx]});
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortDir('asc');
    }
  };
  
  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'confidence') {
      comparison = a.confidence - b.confidence;
    } else if (sortBy === 'label') {
      comparison = a.label.localeCompare(b.label);
    } else {
      // Default sort by index/order
      return 0; // Keep original order
    }
    
    return sortDir === 'asc' ? comparison : -comparison;
  });
  
  if (results.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">No results found. Enter Tamil text and click Analyze.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analysis Results ({results.length})</h2>
        <div className="flex gap-2">
          <div className="flex gap-1 items-center">
            <span className="text-sm">Sort:</span>
            <button 
              className={`px-2 py-1 text-xs rounded ${sortBy === 'index' ? 'bg-orange-200' : 'bg-gray-200'}`}
              onClick={() => handleSort('index')}
            >
              Original
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${sortBy === 'confidence' ? 'bg-orange-200' : 'bg-gray-200'}`}
              onClick={() => handleSort('confidence')}
            >
              Confidence {sortBy === 'confidence' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${sortBy === 'label' ? 'bg-orange-200' : 'bg-gray-200'}`}
              onClick={() => handleSort('label')}
            >
              Label {sortBy === 'label' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <button
            className={`px-2 py-1 text-xs rounded ${detailView ? 'bg-orange-200' : 'bg-gray-200'}`}
            onClick={() => setDetailView(!detailView)}
          >
            {detailView ? 'Simple View' : 'Detail View'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {sortedResults.map((result, idx) => (
          <div 
            key={idx} 
            className={`bg-white p-4 rounded-xl shadow transition-all ${expanded[idx] ? 'ring-2 ring-orange-300' : ''}`}
            onClick={() => toggleExpand(idx)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="font-tamil mb-2">{result.text}</p>
                <div className="flex gap-2 items-center flex-wrap">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.label.toLowerCase() === 'metaphor' ? 'bg-orange-200' : 'bg-blue-200'
                    }`}
                  >
                    {result.label}
                  </span>
                  <span className="text-sm text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="w-full md:w-40">
                <div className="h-3 bg-gray-200 rounded">
                  <div 
                    className={`h-full rounded ${
                      result.confidence > 0.85 ? 'bg-green-500' : 
                      result.confidence > 0.7 ? 'bg-orange-400' : 'bg-red-400'
                    }`} 
                    style={{width: `${result.confidence * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
            
            {detailView && expanded[idx] && (
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">Analysis Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-semibold">Word Count:</span> {result.text.split(/\s+/).filter(Boolean).length}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-semibold">Character Count:</span> {result.text.length}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-semibold">Classification:</span> {result.label}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="font-semibold">Confidence Score:</span> {result.confidence.toFixed(4)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
