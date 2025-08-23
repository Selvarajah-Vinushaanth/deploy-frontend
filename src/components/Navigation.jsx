import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  
  const models = [
    { 
      path: '/', 
      name: 'Metaphor Classifier', 
      description: 'Primary Tamil metaphor classification model' 
    },
    { 
      path: '/model2', 
      name: 'Advanced Sentiment', 
      description: 'Analyze emotional tone in Tamil text' 
    },
    { 
      path: '/model3', 
      name: 'Named Entity', 
      description: 'Identify people, places, organizations in Tamil' 
    }
  ];
  
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {models.map((model) => (
            <Link 
              key={model.path} 
              to={model.path}
              className={`px-4 py-2 rounded-lg transition-all ${
                location.pathname === model.path
                  ? 'bg-orange-200 text-orange-800 font-medium shadow-sm'
                  : 'bg-white hover:bg-orange-100 text-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{model.name}</div>
                <div className="text-xs hidden md:block">{model.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
