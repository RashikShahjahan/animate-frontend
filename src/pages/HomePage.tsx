import React, { useState, useEffect } from 'react';
import { generateAnimation, saveAnimation } from '../api/animationApi';
import AnimationCanvas from '../components/AnimationCanvas';
import useTrackEvent from '../hooks/useTrackEvent';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimationCreated, setIsAnimationCreated] = useState(false);
  const [code, setCode] = useState('');
  const [currentError, setCurrentError] = useState('');
  const { track } = useTrackEvent();
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    // Track page visit with auth status
    track('homepage_visit', { isAuthenticated });
  }, [isAuthenticated]);
  
  const handleCreateAnimation = async () => {
    if (inputText.trim() === '') return;
    
    setIsLoading(true);
    setError('');
    setCurrentError('');
    setIsAnimationCreated(false);
    
    // Track animation creation attempt with auth info
    track('animation_create_attempt', { 
      prompt: inputText,
      isAuthenticated,
      userId: user?.id
    });
    
    try {
      // Call the API endpoint with the user's input
      const data = await generateAnimation({ 
        description: inputText
      });
      
      // Assuming the API returns a p5js sketch code as a string in the 'code' field
      if (data.code) {
        setIsAnimationCreated(true);
        setCode(data.code);
        
        // Track successful animation creation
        track('animation_created', { 
          prompt: inputText,
          success: true,
          isAuthenticated,
          userId: user?.id 
        });
      } else {
        throw new Error('No sketch code received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Animation generation error:', errorMessage);
      
      setCurrentError(errorMessage);
      
      // Track animation creation error
      track('animation_creation_error', { 
        prompt: inputText,
        error: errorMessage,
        isAuthenticated,
        userId: user?.id
      });
      
      setError('Failed to generate animation. Please try again with a different description.');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateAnimation();
    }
  };

  const handleSaveAndShare = async () => {
    try {
      // Track share attempt
      track('animation_share_attempt', {
        isAuthenticated,
        userId: user?.id
      });
      
      const response = await saveAnimation({ 
        code, 
        description: inputText
      });
      const id = response.id;
      
      // Copy the link to clipboard instead of navigating
      const shareUrl = `${window.location.origin}/animation/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Show a success message
      alert('Animation link copied to clipboard!');
      
      // Track successful share
      track('animation_shared', { 
        animationId: id,
        isAuthenticated,
        userId: user?.id
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share animation');
      
      // Track share error
      track('animation_share_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        isAuthenticated,
        userId: user?.id
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-pink-50 to-pink-200 text-pink-800 font-sans">
      <Navbar />
      <div className="flex-grow flex justify-center items-stretch overflow-auto">
        <div className="max-w-full w-full p-3 sm:p-4 bg-white flex flex-col">
          <div className="flex justify-center w-full mb-4 flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-pink-800 relative inline-block mb-2 sm:mb-4 text-center">
              Text to Animation
            </h1>
            {isAuthenticated && user && (
              <div className="text-sm text-pink-600 mb-2 text-center">
                Welcome back, <span className="font-medium">{user.username || user.email}</span>!
              </div>
            )}
            <p className="text-sm text-gray-600 text-center px-2">
              Describe any scene and generate an animation within seconds
            </p>
          </div>
          
          <div className="flex mb-4 gap-2 sm:gap-3 flex-col">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the animation you want to create"
              className="w-full p-3 sm:p-[14px] text-base border-2 border-pink-200 rounded-lg outline-none transition-all duration-200 shadow-sm focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(255,102,179,0.15)]"
              disabled={isLoading}
            />
            <button 
              onClick={handleCreateAnimation}
              className="py-3 sm:py-[14px] px-7 bg-pink-900 text-white font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 shadow-md shadow-pink-700/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-pink-700/40 active:translate-y-0 active:shadow-sm active:shadow-pink-700/40 disabled:bg-pink-400/70 disabled:cursor-not-allowed disabled:shadow-none w-full"
              disabled={isLoading || inputText.trim() === ''}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse"></span>
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse animation-delay-200"></span>
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse animation-delay-400"></span>
                </span>
              ) : (
                'Create'
              )}
            </button>
          </div>
          
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-2.5 text-pink-600 bg-pink-100 py-4 px-5 rounded-lg mb-4 text-center shadow-sm animate-slideIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-medium text-base">{error}</span>
              <button 
                onClick={() => {
                  setInputText('');
                  setError('');
                  setCurrentError('');
                  setCode('');
                  setIsAnimationCreated(false);
                  if (window.p5Instance) {
                    window.p5Instance.remove();
                  }
                }}
                className="mt-2 py-2 px-4 bg-pink-200 text-pink-700 text-sm font-medium rounded-md hover:bg-pink-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!error && (
            <AnimationCanvas 
              isLoading={isLoading}
              isAnimationCreated={isAnimationCreated}
              code={code}
              error={currentError}
            />
          )}
          
          {isAnimationCreated && !error && (
              <div className="mt-2 flex flex-col items-center gap-2">
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => {
                      setInputText('');
                      setIsAnimationCreated(false);
                      setCode('');
                      setCurrentError('');
                      if (window.p5Instance) {
                        window.p5Instance.remove();
                      }
                    }}
                    className="py-3 px-6 bg-pink-50 text-pink-400 text-[15px] font-semibold border-2 border-pink-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-pink-100 active:translate-y-0.5 w-48"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSaveAndShare}
                    className="py-3 px-6 bg-pink-50 text-pink-400 text-[15px] font-semibold border-2 border-pink-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-pink-100 active:translate-y-0.5 w-48"
                  >
                    Copy Link
                  </button>
                </div>
                {isAuthenticated && (
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        track('save_to_collection', { 
                          userId: user?.id,
                          prompt: inputText
                        });
                        alert('Animation saved to your collection!');
                      }}
                      className="py-3 px-6 bg-pink-100 text-pink-600 text-[15px] font-semibold border-2 border-pink-300 rounded-lg cursor-pointer transition-all duration-200 hover:bg-pink-200 active:translate-y-0.5 w-full"
                    >
                      Save to Your Collection
                    </button>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage; 