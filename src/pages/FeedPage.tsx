import React, { useEffect, useState, useCallback } from 'react';
import { getFeed } from '../api/animationApi';
import AnimationCanvas from '../components/AnimationCanvas';
import useTrackEvent from '../hooks/useTrackEvent';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { GetAnimationResponse } from '../types/schemas';

// Interface for a single animation item
interface AnimationItem {
  code: string;
  description: string;
  id: string;
}

const FeedPage: React.FC = () => {
  const [animations, setAnimations] = useState<AnimationItem[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { track } = useTrackEvent();

  // Memoize the track function to prevent it from causing useEffect reruns
  const trackPageVisit = useCallback(() => {
    track('feed_page_visit');
  }, [track]);

  useEffect(() => {
    // Track feed page visit
    trackPageVisit();
    
    const loadFeed = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const animation = await getFeed();
        
        if (animation && animation.id) {
          // Convert the single animation to an array
          const animationArray = [animation];
          setAnimations(animationArray);
          setCurrentAnimation(animation);
          track('random_animation_loaded', { animationId: animation.id });
        } else {
          setError('No animations found');
          track('feed_load_error', { error: 'No animations found' });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load animations');
        console.error(err);
        track('feed_load_error', { error: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, []); // Empty dependency array as we only want to run this on mount

  const handleGetNewAnimation = async () => {
    try {
      // Fetch a new random animation from the backend
      setIsLoading(true);
      const animation = await getFeed();
      
      if (animation && animation.id) {
        // Update the animations array
        const animationArray = [animation];
        setAnimations(animationArray);
        setCurrentAnimation(animation);
        track('random_animation_loaded', { animationId: animation.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load animation');
      console.error(err);
      track('feed_load_error', { error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-pink-50">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-pink-800 mb-6">Random Animation</h1>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-pink-400 h-64 w-full">
            <div className="w-[50px] h-[50px] border-4 border-pink-400/20 rounded-full border-t-pink-400 animate-spin mb-5"></div>
            <p>Loading animation...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-2.5 text-pink-600 bg-pink-100 py-4 px-5 rounded-lg mb-4 text-center shadow-sm animate-slideIn w-full max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="font-medium text-base">{error}</span>
          </div>
        )}
        
        {!isLoading && !error && currentAnimation && (
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[400px] p-2">
              <AnimationCanvas 
                isLoading={false}
                isAnimationCreated={true}
                code={currentAnimation.code}
                error=""
              />
            </div>
            
            <div className="p-4 bg-white">
              <h3 className="font-medium text-lg text-pink-800 mb-2">
                {currentAnimation.description}
              </h3>
              
              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={handleGetNewAnimation}
                  className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-400 transition-colors disabled:opacity-50 disabled:hover:bg-pink-500 disabled:cursor-not-allowed"
                  title="Fetch another random animation"
                >
                  Get Another
                </button>
                
                <Link 
                  to={`/animation/${currentAnimation.id}`}
                  className="bg-pink-900 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-800 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !currentAnimation && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#aabdd9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="M9 9h.01"></path>
              <path d="M15 9h.01"></path>
              <path d="M8 13h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8z"></path>
            </svg>
            <h3 className="text-lg font-medium text-pink-800">No animations available</h3>
            <p className="text-gray-600">Check back later for amazing animations or create your own!</p>
            <Link 
              to="/home" 
              className="mt-4 bg-pink-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-800 transition-colors"
            >
              Create Animation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
