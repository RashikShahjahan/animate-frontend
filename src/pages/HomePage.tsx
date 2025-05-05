import React, { useState, useEffect } from 'react';
import { fixAnimation, generateAnimation, saveAnimation } from '../api/animationApi';
import AnimationCanvas from '../components/AnimationCanvas';
import { useNavigate } from 'react-router-dom';
import useTrackEvent from '../hooks/useTrackEvent';

function HomePage() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimationCreated, setIsAnimationCreated] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { track } = useTrackEvent();
  
  useEffect(() => {
    // Track page visit
    track('homepage_visit');
  }, [track]);
  
  const handleCreateAnimation = async () => {
    if (inputText.trim() === '') return;
    
    setIsLoading(true);
    setError('');
    setIsAnimationCreated(false);
    
    // Track animation creation attempt
    track('animation_create_attempt', { prompt: inputText });
    
    try {
      // Call the API endpoint with the user's input
      const data = await generateAnimation({ description: inputText });
      
      // Assuming the API returns a p5js sketch code as a string in the 'code' field
      if (data.code) {
        setIsAnimationCreated(true);
        setCode(data.code);
        
        // Track successful animation creation
        track('animation_created', { 
          prompt: inputText,
          success: true 
        });
      } else {
        throw new Error('No sketch code received from API');
      }
    } catch (err) {
      let count = 0;
      let retrySuccess = false;
      
      // Track animation creation error
      track('animation_creation_error', { 
        prompt: inputText,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      
      // Try to fix the animation up to 3 times
      while (count < 3) {
        try {
          const data = await fixAnimation({ broken_code: code, error_message: err instanceof Error ? err.message : 'Unknown error' });
          if (data.code) {
            setIsAnimationCreated(true);
            setCode(data.code);
            retrySuccess = true;
            
            // Track successful animation fix
            track('animation_fixed', { 
              prompt: inputText,
              attempts: count + 1
            });
            
            break;
          }
        } catch (fixErr) {
          console.error('Fix attempt failed:', fixErr);
        }
        count++;
      }
      
      // If all retry attempts failed, show a clear error message
      if (!retrySuccess) {
        setError('We tried multiple times but couldn\'t generate your animation. Please try again with a different description.');
        
        // Track all fixes failed
        track('animation_fix_failed', { 
          prompt: inputText,
          attempts: count
        });
      } else {
        setError('');
      }
      console.error(err);
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
      track('animation_share_attempt');
      
      const response = await saveAnimation({ code });
      const id = response.id;
      
      // Track successful share
      track('animation_shared', { animationId: id });
      
      // Navigate to the shared animation
      navigate(`/animation/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share animation');
      
      // Track share error
      track('animation_share_error', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-stretch bg-gradient-to-br from-pink-50 to-pink-200 text-pink-800 font-sans overflow-hidden">
      <div className="max-w-full w-full h-full p-4 bg-white flex flex-col">
        <div className="flex justify-center w-full mb-2 flex-col items-center">
          <h1 className="text-2xl font-bold text-pink-800 relative inline-block mb-4">
            Text to GIF
          </h1>
          <p className="text-sm text-gray-600">
            Describe any scene and generate a GIF within seconds
          </p>
        </div>
        
        <div className="flex mb-4 gap-3 sm:flex-row flex-col">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the animation you want to create"
            className="flex-grow p-[14px] text-base border-2 border-pink-200 rounded-lg outline-none transition-all duration-200 shadow-sm focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(255,102,179,0.15)]"
            disabled={isLoading}
          />
          <button 
            onClick={handleCreateAnimation}
            className="py-[14px] px-7 bg-pink-900 text-white font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 shadow-md shadow-pink-700/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-pink-700/40 active:translate-y-0 active:shadow-sm active:shadow-pink-700/40 disabled:bg-pink-400/70 disabled:cursor-not-allowed disabled:shadow-none sm:w-auto w-full"
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
            error={error}
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
                  Share
                </button>
              </div>
            </div>
        )}
        
      
      </div>
    </div>
  );
}

export default HomePage; 