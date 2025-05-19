import React, { useEffect, useState, useCallback } from 'react';
import { getFeed, saveMood } from '../api/animationApi';
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

// Mood type for feedback
type MoodType = 'much worse' | 'worse' | 'same' | 'better' | 'much better' | null;

const FeedPage: React.FC = () => {
  const [animations, setAnimations] = useState<AnimationItem[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareTooltip, setShareTooltip] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [moodSaved, setMoodSaved] = useState(false);
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
      // Reset mood selection for new animation
      setSelectedMood(null);
      setMoodSaved(false);
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

  const handleShare = useCallback(() => {
    if (!currentAnimation) return;
    
    const shareUrl = `${window.location.origin}/animation/${currentAnimation.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareTooltip(true);
        track('animation_shared', { animationId: currentAnimation.id });
        
        // Hide tooltip after 2 seconds
        setTimeout(() => {
          setShareTooltip(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  }, [currentAnimation]);

  const handleMoodSelection = (mood: MoodType) => {
    setSelectedMood(mood);
    setMoodSaved(false);
    
    if (currentAnimation && mood) {
      // Track the mood feedback event
      track('mood_feedback_submitted', { 
        animationId: currentAnimation.id,
        mood: mood 
      });
      
      // Save the mood feedback to the server
      saveMood({
        animationId: currentAnimation.id,
        mood: mood
      })
      .then(() => {
        console.log('Mood feedback saved successfully');
        setMoodSaved(true);
        
        // Hide the saved message after 3 seconds
        setTimeout(() => {
          setMoodSaved(false);
        }, 3000);
      })
      .catch((error) => {
        console.error('Failed to save mood feedback:', error);
      });
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
          <div className="flex flex-col items-center gap-2.5 text-pink-600 bg-pink-100 py-4 px-5 rounded-lg mb-4 text-center shadow-sm animate-slideIn w-full max-w-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="font-medium text-base">{error}</span>
          </div>
        )}
        
        {!isLoading && !error && currentAnimation && (
          <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[400px] p-2 bg-white overflow-hidden">
              <div className="h-full w-full">
                <AnimationCanvas 
                  isLoading={false}
                  isAnimationCreated={true}
                  code={currentAnimation.code}
                  error=""
                  className="!min-h-0 h-full"
                />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100">
              <h3 className="font-medium text-lg text-pink-800 mb-2">
                {currentAnimation.description}
              </h3>
              
              {/* Mood Feedback Section */}
              <div className="mt-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600 text-center flex-1">How did this animation make you feel?</p>
                  {moodSaved && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-fadeIn">
                      Feedback saved! ✓
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => handleMoodSelection('much worse')}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${selectedMood === 'much worse' ? 'bg-pink-100 scale-110' : 'hover:bg-pink-50'}`}
                    title="Much worse"
                  >
                    <span className="text-2xl">😞</span>
                    <span className="text-xs mt-1">Much worse</span>
                  </button>
                  
                  <button 
                    onClick={() => handleMoodSelection('worse')}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${selectedMood === 'worse' ? 'bg-pink-100 scale-110' : 'hover:bg-pink-50'}`}
                    title="Worse"
                  >
                    <span className="text-2xl">😟</span>
                    <span className="text-xs mt-1">Worse</span>
                  </button>
                  
                  <button 
                    onClick={() => handleMoodSelection('same')}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${selectedMood === 'same' ? 'bg-pink-100 scale-110' : 'hover:bg-pink-50'}`}
                    title="Same"
                  >
                    <span className="text-2xl">😐</span>
                    <span className="text-xs mt-1">Same</span>
                  </button>
                  
                  <button 
                    onClick={() => handleMoodSelection('better')}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${selectedMood === 'better' ? 'bg-pink-100 scale-110' : 'hover:bg-pink-50'}`}
                    title="Better"
                  >
                    <span className="text-2xl">😊</span>
                    <span className="text-xs mt-1">Better</span>
                  </button>
                  
                  <button 
                    onClick={() => handleMoodSelection('much better')}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${selectedMood === 'much better' ? 'bg-pink-100 scale-110' : 'hover:bg-pink-50'}`}
                    title="Much better"
                  >
                    <span className="text-2xl">😄</span>
                    <span className="text-xs mt-1">Much better</span>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={handleGetNewAnimation}
                  disabled={selectedMood === null}
                  className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-400 transition-colors disabled:opacity-50 disabled:hover:bg-pink-500 disabled:cursor-not-allowed"
                  title={selectedMood === null ? "Please rate your mood first" : "Fetch another random animation"}
                >
                  Get Another
                </button>
                
                <div className="flex gap-2 relative">
                  <button
                    onClick={handleShare}
                    disabled={selectedMood === null}
                    className="bg-pink-700 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:hover:bg-pink-700 disabled:cursor-not-allowed"
                    title={selectedMood === null ? "Please rate your mood first" : "Share this animation"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </button>
                  
                  {shareTooltip && (
                    <div className="absolute -top-10 right-0 bg-pink-900 text-white text-xs py-1 px-2 rounded shadow-md animate-fadeIn">
                      Link copied!
                    </div>
                  )}
                  
                  <Link 
                    to={`/animation/${currentAnimation.id}`}
                    className="bg-pink-900 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !currentAnimation && (
          <div className="flex flex-col items-center gap-4 text-center max-w-xl">
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
