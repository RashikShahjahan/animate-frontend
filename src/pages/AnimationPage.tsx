import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimation } from '../api/animationApi';
import AnimationCanvas from '../components/AnimationCanvas';
import useTrackEvent from '../hooks/useTrackEvent';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function AnimationPage() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const { track } = useTrackEvent();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Track shared animation page view
    if (id) {
      track('shared_animation_view', { animationId: id });
    }
    
    const loadAnimation = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const data = await getAnimation({ id });
        
        if (data.code) {
          setCode(data.code);
          if (data.description) {
            setDescription(data.description);
          }
          
          // Track successful animation load
          track('animation_loaded', { 
            animationId: id,
            hasDescription: !!data.description,
            isAuthenticated: isAuthenticated
          });
        } else {
          throw new Error('No animation code found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load animation');
        console.error(err);
        
        // Track animation load error
        track('animation_load_error', { 
          animationId: id,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [id, isAuthenticated]);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/animation/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('URL copied to clipboard!');
    
    // Track share link copy
    track('share_link_copied', { animationId: id });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-pink-50 to-pink-200 text-pink-800 font-sans">
      <Navbar />
      <div className="flex-grow flex justify-center items-stretch overflow-auto p-2 sm:p-4">
        <div className="max-w-full w-full bg-white flex flex-col rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between w-full p-4 mb-2 gap-2">
            <Link 
              to="/home"
              className="flex items-center text-pink-400 hover:text-pink-600 transition-colors duration-200"
              onClick={() => track('navigation_to_home')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-pink-800 relative text-center">
              Shared Animation
            </h1>
            <div className="w-[100px] hidden sm:block"></div> {/* Spacer for centering on desktop */}
          </div>
          
          
          {error && (
            <div className="flex items-center gap-2.5 text-pink-600 bg-pink-100 py-3 px-4 rounded-lg mx-4 mb-4 text-left text-sm border-l-4 border-pink-600 shadow-sm animate-slideIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {description && (
            <div className="mb-4 mx-4 p-4 bg-pink-50 rounded-lg text-pink-800 text-sm">
              <h3 className="font-medium mb-1">Prompt:</h3>
              <p>{description}</p>
            </div>
          )}
          
          <div className="px-4">
            <AnimationCanvas 
              isLoading={isLoading}
              isAnimationCreated={!isLoading && code !== ''}
              code={code}
              error={error}
            />
          </div>
          
          <div className="mt-4 mb-4 flex justify-center gap-3">
            <button 
              onClick={handleCopyShareLink}
              className="py-3 px-6 bg-pink-50 text-pink-400 text-[15px] font-semibold border-2 border-pink-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-pink-100 active:translate-y-0.5 w-full sm:w-48 max-w-xs"
            >
              Copy Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationPage; 