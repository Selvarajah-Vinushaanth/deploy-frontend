import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'metaphor-classifier',
      title: 'Metaphor Classifier',
      description: 'Analyze Tamil text to identify metaphorical expressions with AI',
      icon: '🎭',
      color: 'from-orange-500 to-amber-600',
      route: '/metaphor-classifier',
      features: ['Detect metaphors in text', 'Confidence scores', 'Visual analysis']
    },
    {
      id: 'lyric-generator',
      title: 'Lyric Generator',
      description: 'Generate beautiful Tamil lyrics based on themes and emotions',
      icon: '🎵',
      color: 'from-blue-500 to-indigo-600',
      route: '/lyric-generator',
      features: ['Theme-based generation', 'Continue lyrics', 'Multiple variations']
    },
    {
      id: 'metaphor-creator',
      title: 'Metaphor Creator',
      description: 'Create custom metaphors by combining source and target concepts',
      icon: '✨',
      color: 'from-purple-500 to-pink-600',
      route: '/metaphor-creator',
      features: ['Custom creation', 'Source & target mapping', 'Multiple styles']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      
      {/* Hero Section */}
      <header className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Tamil AI Tools
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Discover the beauty of Tamil language with our AI-powered tools. Analyze metaphors,
          generate lyrics, and explore creative writing effortlessly.
        </p>
      </header>

      {/* Cards Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-gray-800 rounded-3xl shadow-2xl hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transform hover:-translate-y-3 transition-all cursor-pointer overflow-hidden border border-gray-700"
            onClick={() => navigate(card.route)}
          >
            <div className={`bg-gradient-to-r ${card.color} h-3 w-full`}></div>
            <div className="p-8 flex flex-col justify-between h-full">
              <div>
                <div className="text-6xl mb-4">{card.icon}</div>
                <h2 className="text-2xl font-bold mb-2 text-white">{card.title}</h2>
                <p className="text-gray-300 mb-5">{card.description}</p>

                <ul className="space-y-2">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-400">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color} mr-2`}></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button 
                className={`mt-6 w-full py-3 rounded-xl bg-gradient-to-r ${card.color} text-white font-semibold hover:opacity-90 transition-opacity`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-800 mt-12">
        <p>Tamil AI Models &copy; 2025 | Created by Vinushaanth</p>
      </footer>
    </div>
  );
}
