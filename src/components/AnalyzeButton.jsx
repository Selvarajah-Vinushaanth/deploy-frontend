import React, { useState } from 'react';

export default function AnalyzeButton({ onAnalyze }) {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await onAnalyze();
      setAnalyzed(true);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        className={`bg-gradient-to-r from-yellow-100 to-orange-200 px-6 py-3 rounded-xl text-lg font-semibold 
          transition-all duration-300 relative
          ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md'}`}
        onClick={handleClick}
        disabled={loading}
      >
        <div className="flex items-center gap-2 justify-center">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <span role="img" aria-label="analyze">🔍</span>
              {analyzed ? 'Analyze Again' : 'Analyze Text'}
            </>
          )}
        </div>
      </button>
      
      {analyzed && !loading && (
        <p className="text-sm text-gray-500">
          Analysis complete! Scroll down to see results.
        </p>
      )}
      
      <div className="text-xs text-gray-400 mt-1">
        Powered by Hugging Face's transformer models
      </div>
    </div>
  );
}
