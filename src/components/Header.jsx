import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Default user image URL
  const defaultUserImage = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.displayName || currentUser?.email || 'User') + '&background=6366f1&color=fff&size=150';

  // Get Google profile image or use default
  const getProfileImageUrl = () => {
    // First priority: Google profile photo from Firebase Auth
    if (currentUser?.photoURL) {
      return currentUser.photoURL;
    }
    
    // Second priority: default generated avatar
    return defaultUserImage;
  };

  function handleImageError(e) {
    // If Google image fails, try default avatar
    if (e.target.src !== defaultUserImage) {
      e.target.src = defaultUserImage;
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-xl sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Tamil AI
              </span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6">
            {/* <Link 
              to="/" 
              className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-purple-500/20 text-purple-300 shadow-inner' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              Home
            </Link> */}
            
            {currentUser ? (
              <>
                {/* <Link 
                  to="/chat" 
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive('/chat') 
                      ? 'bg-purple-500/20 text-purple-300 shadow-inner' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  Chat
                </Link> */}
                
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive('/profile') 
                      ? 'bg-purple-500/20 text-purple-300 shadow-inner' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-sm font-medium">
                      {currentUser.displayName || 'User Profile'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {currentUser.email && currentUser.email.length > 18 
                        ? `${currentUser.email.substring(0, 15)}...` 
                        : currentUser.email}
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0 shadow-md">
                    <img
                      className="h-full w-full object-cover"
                      src={getProfileImageUrl()}
                      alt={currentUser.displayName || "User profile"}
                      onError={handleImageError}
                    />
                  </div>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-800/20 hover:from-red-600 hover:to-red-700 text-red-300 hover:text-white rounded-lg text-base font-medium transition-all duration-300 border border-red-700/30 hover:border-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white px-4 py-3 border border-gray-700 hover:border-gray-600 rounded-lg text-base font-medium transition-all hover:bg-gray-800/70"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-3 rounded-lg text-base font-medium shadow-md hover:shadow-purple-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
