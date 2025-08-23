import React, { useState } from 'react';

export default function Sidebar({ filters, setFilters, exportResults }) {
  const [confidenceValue, setConfidenceValue] = useState(0);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const handleConfidenceChange = (e) => {
    const value = parseFloat(e.target.value);
    setConfidenceValue(value);
    setFilters({...filters, confidence: value});
  };
  
  return (
    <aside className="w-full md:w-72 bg-white p-5 rounded-xl shadow-md flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Analysis Controls</h2>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
        >
          {isFilterCollapsed ? 'Show Filters' : 'Hide Filters'}
        </button>
      </div>
      
      <div className={`flex flex-col gap-4 ${isFilterCollapsed ? 'hidden md:flex' : 'flex'}`}>
        {/* Filter Section */}
        <div className="border-b pb-4">
          <h3 className="text-md font-medium mb-3">Filters</h3>
          
          <div className="mb-3">
            <label className="text-sm font-medium block mb-1">Classification Type</label>
            <select 
              className="w-full border rounded-md p-2 bg-gray-50"
              onChange={e => setFilters({...filters, type: e.target.value})}
            >
              <option value="all">All Results</option>
              <option value="metaphor">Metaphors Only</option>
              <option value="literal">Literal Only</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="text-sm font-medium block mb-1">
              Confidence Threshold: {(confidenceValue * 100).toFixed(0)}%
            </label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={confidenceValue}
              className="w-full accent-orange-400"
              onChange={handleConfidenceChange}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-sm font-medium block mb-1">Sentence Length</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min words"
                className="w-1/2 border rounded-md p-2 bg-gray-50"
                onChange={e => setFilters({...filters, minLength: parseInt(e.target.value) || 0})}
              />
              <input 
                type="number" 
                placeholder="Max words"
                className="w-1/2 border rounded-md p-2 bg-gray-50"
                onChange={e => setFilters({...filters, maxLength: parseInt(e.target.value) || 1000})}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-sm font-medium block mb-1">Search in Results</label>
            <input 
              type="text" 
              placeholder="Search keyword..."
              className="w-full border rounded-md p-2 bg-gray-50"
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <button 
            className="w-full bg-gray-100 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors mt-2"
            onClick={() => setFilters({})}
          >
            Reset Filters
          </button>
        </div>
        
        {/* Export Section */}
        <div>
          <h3 className="text-md font-medium mb-3">Export Options</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="bg-orange-200 hover:bg-orange-300 px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1"
              onClick={() => exportResults('csv')}
            >
              <span role="img" aria-label="csv">📊</span> CSV
            </button>
            <button 
              className="bg-orange-200 hover:bg-orange-300 px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1"
              onClick={() => exportResults('json')}
            >
              <span role="img" aria-label="json">📋</span> JSON
            </button>
            <button 
              className="bg-orange-200 hover:bg-orange-300 px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1 col-span-2"
              onClick={() => window.print()}
            >
              <span role="img" aria-label="print">🖨️</span> Print Results
            </button>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 mt-2">
          <h4 className="font-medium mb-1">About This Tool</h4>
          <p>This Tamil Metaphor Classifier uses a machine learning model to identify metaphorical language in Tamil text.</p>
          <p className="mt-2">Created by Vinushaanth using Hugging Face Transformers.</p>
        </div>
      </div>
    </aside>
  );
}
