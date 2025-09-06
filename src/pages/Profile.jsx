import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Profile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Default user image URL
  const defaultUserImage = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.displayName || currentUser?.email || 'User') + '&background=6366f1&color=fff&size=150';

  // Get Google profile image or use current photoURL
  const getProfileImageUrl = () => {
    // First priority: uploaded/custom photoURL
    if (photoURL && !photoURL.includes('ui-avatars.com')) {
      return photoURL;
    }
    
    // Second priority: Google profile photo from Firebase Auth
    if (currentUser?.photoURL) {
      return currentUser.photoURL;
    }
    
    // Third priority: default generated avatar
    return defaultUserImage;
  };

  // Initialize photoURL with Google profile image if available
  React.useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser?.photoURL]);

  async function handleLogout() {
    setError('');

    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    
    if (!displayName.trim()) {
      return setError('Display name cannot be empty');
    }

    try {
      setError('');
      setLoading(true);
      
      // Update the user profile with new data
      await updateUserProfile(currentUser, { 
        displayName,
        photoURL: photoURL || currentUser?.photoURL
      });
      
      // Force a refresh of the auth state to update the header immediately
      // This is handled by the AuthContext's onAuthStateChanged listener
      
      setMessage('Profile updated successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  function handleImageClick() {
    fileInputRef.current.click();
  }
  
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('image')) {
      return setError('Please select an image file');
    }
    
    try {
      setUploadingImage(true);
      setError('');
      
      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setPhotoURL(imageUrl);
      
      // In a real app, you would:
      // 1. Upload file to Firebase Storage
      // 2. Get permanent URL
      // 3. Update user profile with permanent URL
      
      // For now, simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful upload in a real app:
      // await updateUserProfile(currentUser, { photoURL: permanentUrl });
      
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleImageError(e) {
    // If Google image fails, try default avatar
    if (e.target.src !== defaultUserImage) {
      e.target.src = defaultUserImage;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          <div className="bg-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-700 relative">
            <button 
              onClick={() => navigate('/')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="px-6 py-8 sm:p-10">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white">User Profile</h1>
                <p className="text-gray-400 mt-2">Manage your account settings</p>
              </div>

              {error && (
                <div className="mt-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {message && (
                <div className="mt-6 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{message}</span>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
                    <div 
                      className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-purple-500"
                      onClick={handleImageClick}
                    >
                      {uploadingImage ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={getProfileImageUrl()}
                            alt="Profile"
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-center text-gray-400 mt-4">
                      Click to change profile picture
                    </p>
                    <p className="text-white font-medium mt-4 text-center break-all text-sm px-2">
                      {currentUser?.email}
                    </p>
                    
                    <button
                      onClick={handleLogout}
                      className="mt-6 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 w-full justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-400">
                          Display Name
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Email Address
                        </label>
                        <div className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-300 sm:text-sm">
                          {currentUser?.email} 
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="block text-sm font-medium text-gray-400">
                          Account Created
                        </p>
                        <p className="mt-1 text-sm text-gray-300">
                          {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
