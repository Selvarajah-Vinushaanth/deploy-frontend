import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [clickedCard, setClickedCard] = useState(null);

  // Function to navigate with animation
  function handleNavigate(route, cardId = null) {
    if (cardId) {
      setClickedCard(cardId);
      // Delay navigation to allow animation to play
      setTimeout(() => {
        navigate(route);
        window.scrollTo(0, 0);
      }, 400); // Match this with animation duration
    } else {
      navigate(route);
      // window.scrollTo(0, 0);
    }
  }

  const cards = [
    {
      id: 'metaphor-classifier',
      title: 'Metaphor Classifier',
      description: 'Analyze Tamil text to identify metaphorical expressions with AI',
      icon: '🎭',
      color: 'from-purple-500 to-pink-600',
      route: '/metaphor-classifier',
      features: ['Detect metaphors in text', 'Confidence scores', 'Visual analysis']
    },
    {
      id: 'lyric-generator',
      title: 'Lyric Generator',
      description: 'Generate beautiful Tamil lyrics based on themes and emotions',
      icon: '🎵',
      color: 'from-indigo-700 to-purple-600',
      route: '/lyric-generator',
      features: ['Theme-based generation', 'Continue lyrics', 'Multiple variations']
    },
    {
      id: 'metaphor-creator',
      title: 'Metaphor Creator',
      description: 'Create custom metaphors by combining source and target concepts',
      icon: '✨',
      color: 'from-amber-500 to-yellow-400',
      route: '/metaphor-creator',
      features: ['Custom creation', 'Source & target mapping', 'Multiple styles']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      <Header />
      
      {/* Hero Section with reduced spacing */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 right-40 w-48 h-48 bg-green-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        <header className="relative pt-12 pb-12 px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6 tracking-tight">
            Tamil AI Tools
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover the beauty of Tamil language with our AI-powered tools. Analyze metaphors,
            generate lyrics, and explore creative writing effortlessly.
          </p>
          
          {currentUser && (
            <div className="mt-8 mb-6">
              <button 
                onClick={() => handleNavigate('/chat')}
                className="inline-flex items-center px-10 py-5 border border-transparent text-lg font-medium rounded-full shadow-lg shadow-green-500/30 text-white bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Open Chat Assistant
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Main Service Cards Section - Adjusted top spacing */}
      <div className="mx-auto w-full max-w-7xl px-6 mb-24 mt-4">
        {/* Chat Assistant - Enhanced Featured Card */}
        <div 
          className={`mb-16 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 bg-gradient-to-r from-gray-800/90 to-gray-900/90 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all cursor-pointer transform hover:scale-[1.02] ${clickedCard === 'chat' ? 'animate-card-click' : ''}`}
          onClick={() => handleNavigate('/chat', 'chat')}
        >
          <div className="md:flex">
            <div className="md:w-2/3 p-12">
              <div className="inline-block px-4 py-2 rounded-full bg-green-900/30 text-green-400 text-sm font-medium mb-8">
                Featured Service
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">Tamil Chat Assistant</h2>
              <p className="text-gray-300 text-xl mb-10 leading-relaxed">
                Engage in natural conversations with our advanced Tamil language AI assistant. Get help with translations, 
                cultural insights, and writing assistance in real-time.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300 text-lg">Natural conversations in Tamil</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300 text-lg">Language translation assistance</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300 text-lg">Cultural insights and explanations</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-green-500 to-teal-400 flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300 text-lg">24/7 available AI assistance</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double navigation
                  handleNavigate('/chat');
                }}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-500 to-teal-400 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all transform hover:translate-y-[-2px]"
              >
                Start Chatting
              </button>
            </div>
            <div className="md:w-1/3 bg-gradient-to-br from-green-500/20 to-teal-400/20 flex items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute w-40 h-40 bg-green-400/10 rounded-full -top-10 -right-10 blur-xl"></div>
              <div className="absolute w-40 h-40 bg-teal-400/10 rounded-full -bottom-10 -left-10 blur-xl"></div>
              <div className="text-[160px] relative animate-float">💬</div>
            </div>
          </div>
        </div>
        
        {/* Section Title with enhanced styling */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white inline-block pb-3 border-b-2 border-purple-500 px-8">
            Our Microservices
          </h2>
          <p className="mt-6 text-gray-300 max-w-2xl mx-auto text-lg">
            Specialized tools designed to enhance your Tamil language experience
          </p>
        </div>

        {/* Enhanced Microservices Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-gray-800/90 rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transform hover:-translate-y-3 transition-all cursor-pointer overflow-hidden border border-gray-700 h-full flex flex-col ${clickedCard === card.id ? 'animate-card-click' : ''}`}
              onClick={() => handleNavigate(card.route, card.id)}
            >
              <div className={`bg-gradient-to-r ${card.color} h-3 w-full`}></div>
              <div className="p-10 flex-grow flex flex-col">
                <div className="flex-grow">
                  <div className="text-7xl mb-6 transform transition-transform group-hover:scale-110">{card.icon}</div>
                  <h2 className="text-2xl font-bold mb-4 text-white">{card.title}</h2>
                  <p className="text-gray-300 mb-8 text-base leading-relaxed">{card.description}</p>

                  <ul className="space-y-3 mb-8">
                    {card.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-400 text-base">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.color} mr-3 flex-shrink-0`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent double navigation
                    handleNavigate(card.route);
                  }}
                  className={`w-full py-4 rounded-xl bg-gradient-to-r ${card.color} text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Footer - Keeping same spacing */}
      <footer className="text-center py-10 text-gray-400 text-sm border-t border-gray-800 mt-auto">
        <p className="mb-2">Tamil AI Models &copy; 2025 | Created by Group-23</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
            <span className="sr-only">GitHub</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
            <span className="sr-only">Twitter</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <button className="text-gray-500 hover:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
        </div>
      </footer>
    </div>
  );
}
