import React from 'react';

export default function StatsSection({ stats }) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }
  
  // Calculate percentages
  const totalSentences = stats.total_sentences || 0;
  const metaphorCount = stats.metaphor_count || 0;
  const literalCount = stats.literal_count || 0;
  const metaphorPercentage = totalSentences > 0 ? (metaphorCount / totalSentences * 100).toFixed(1) : 0;
  const literalPercentage = totalSentences > 0 ? (literalCount / totalSentences * 100).toFixed(1) : 0;
  const avgConfidence = stats.average_confidence || 0;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Analysis Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Summary</h3>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sentences:</span>
              <span className="font-semibold">{totalSentences}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Confidence:</span>
              <span className="font-semibold">{(avgConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High Confidence:</span>
              <span className="font-semibold">{stats.high_confidence_count || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Distribution Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Distribution</h3>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Metaphors:</span>
            <span className="font-semibold">{metaphorCount} ({metaphorPercentage}%)</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full mb-3">
            <div className="h-full bg-orange-400 rounded-full" style={{width: `${metaphorPercentage}%`}}></div>
          </div>
          
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Literal:</span>
            <span className="font-semibold">{literalCount} ({literalPercentage}%)</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full">
            <div className="h-full bg-blue-400 rounded-full" style={{width: `${literalPercentage}%`}}></div>
          </div>
        </div>
        
        {/* Confidence Meter */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Confidence Meter</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-full">
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    avgConfidence > 0.85 ? 'bg-green-500' : 
                    avgConfidence > 0.7 ? 'bg-orange-400' : 'bg-red-400'
                  }`} 
                  style={{width: `${avgConfidence * 100}%`}}
                ></div>
              </div>
            </div>
            <span className="text-xl font-bold">{(avgConfidence * 100).toFixed(0)}%</span>
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {avgConfidence > 0.85 ? 'High confidence in predictions' : 
             avgConfidence > 0.7 ? 'Moderate confidence in predictions' : 
             'Low confidence in predictions'}
          </div>
        </div>
      </div>
    </div>
  );
}
