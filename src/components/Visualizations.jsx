import React, { useState } from 'react';
import Plot from 'react-plotly.js';

export default function Visualizations({ data }) {
  const [activeTab, setActiveTab] = useState('distribution');
  
  // Check if we have valid data
  if (!data || !data.distValues || !data.labels || !data.confidence) {
    return null;
  }
  
  // Set up colors and themes
  const colors = {
    metaphor: 'rgb(255, 159, 64)', // orange
    literal: 'rgb(54, 162, 235)',  // blue
    background: 'rgb(250, 250, 250)',
    text: '#333333'
  };
  
  // Common layout properties
  const commonLayout = {
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: colors.text
    },
    paper_bgcolor: colors.background,
    plot_bgcolor: colors.background,
    margin: { t: 40, r: 10, l: 40, b: 40 },
    height: 320
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Visualizations</h2>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded ${activeTab === 'distribution' ? 'bg-orange-200' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('distribution')}
          >
            Distribution
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${activeTab === 'confidence' ? 'bg-orange-200' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('confidence')}
          >
            Confidence
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${activeTab === 'advanced' ? 'bg-orange-200' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        {activeTab === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Plot
              data={[
                {
                  type: 'pie',
                  values: data.distValues,
                  labels: data.labels,
                  hole: 0.4,
                  marker: {
                    colors: [colors.literal, colors.metaphor],
                  },
                  textinfo: 'label+percent',
                  hoverinfo: 'label+percent+value',
                  textposition: 'inside',
                  insidetextfont: {
                    size: 14,
                    color: 'white'
                  },
                  pull: [0, 0.05], // Pull the metaphor slice out slightly
                  domain: { row: 0, column: 0 }
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Metaphor vs Literal Distribution',
                showlegend: false,
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
            
            <Plot
              data={[
                {
                  type: 'bar',
                  x: data.labels,
                  y: data.distValues,
                  marker: {
                    color: [colors.literal, colors.metaphor],
                  },
                  text: data.distValues,
                  textposition: 'auto',
                  hoverinfo: 'x+y',
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Metaphor vs Literal Count',
                xaxis: { title: 'Category' },
                yaxis: { title: 'Count' },
                bargap: 0.3,
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        )}
        
        {activeTab === 'confidence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Plot
              data={[
                {
                  type: 'violin',
                  y: data.confidence,
                  box: { visible: true },
                  meanline: { visible: true },
                  marker: { color: colors.metaphor },
                  fillcolor: colors.metaphor,
                  opacity: 0.6,
                  hoverinfo: 'y+name',
                  name: 'Confidence'
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Confidence Distribution',
                yaxis: { 
                  title: 'Confidence Score', 
                  range: [0, 1],
                  tickformat: '.0%'
                }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
            
            <Plot
              data={[
                {
                  type: 'histogram',
                  x: data.confidence,
                  marker: { color: colors.metaphor },
                  opacity: 0.7,
                  nbinsx: 10,
                  hoverinfo: 'x+y',
                  name: 'Confidence Scores'
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Confidence Histogram',
                xaxis: { 
                  title: 'Confidence Score',
                  range: [0, 1],
                  tickformat: '.0%'
                },
                yaxis: { title: 'Frequency' }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Plot
              data={[
                {
                  type: 'heatmap',
                  z: [data.confidence],
                  colorscale: [
                    [0, 'rgb(255, 99, 132)'],    // red for low confidence
                    [0.5, 'rgb(255, 159, 64)'],  // orange for medium
                    [1, 'rgb(75, 192, 192)']     // green for high confidence
                  ],
                  showscale: true,
                  hoverinfo: 'z',
                  colorbar: {
                    title: 'Confidence',
                    tickformat: '.0%'
                  }
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Confidence Heatmap by Sentence',
                xaxis: { 
                  title: 'Sentences',
                  showticklabels: false
                },
                yaxis: {
                  showticklabels: false
                }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
            
            <Plot
              data={[
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: Array.from({ length: data.confidence.length }, (_, i) => i + 1),
                  y: data.confidence,
                  marker: {
                    size: 12,
                    color: data.confidence,
                    colorscale: [
                      [0, 'rgb(255, 99, 132)'],
                      [0.5, 'rgb(255, 159, 64)'],
                      [1, 'rgb(75, 192, 192)']
                    ],
                    showscale: true,
                    colorbar: {
                      title: 'Confidence',
                      tickformat: '.0%'
                    }
                  },
                  hoverinfo: 'y',
                  name: 'Confidence by Sentence'
                }
              ]}
              layout={{
                ...commonLayout,
                title: 'Confidence by Sentence',
                xaxis: { title: 'Sentence Index' },
                yaxis: { 
                  title: 'Confidence Score',
                  range: [0, 1],
                  tickformat: '.0%'
                }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
