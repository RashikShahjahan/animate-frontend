import React, { useEffect, useRef, useState } from 'react';
import { runThreeSketch } from '../utils/threeUtils';

interface AnimationCanvasProps {
  isLoading: boolean;
  isAnimationCreated: boolean;
  code: string;
  error: string;
  className?: string;
}

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({ 
  isLoading, 
  isAnimationCreated, 
  code, 
  error,
  className = ''
}) => {
  const sketchContainerRef = useRef<HTMLDivElement>(null);
  const [canvasError, setCanvasError] = useState<string>('');
  
  // Clean up any previous Three.js instance when component unmounts
  useEffect(() => {
    return () => {
      if (window.threeAnimationId) {
        try {
          cancelAnimationFrame(window.threeAnimationId);
          window.threeAnimationId = null;
        } catch (e) {
          console.warn('Error cleaning up Three.js animation:', e);
        }
      }
      if (window.threeRenderer) {
        try {
          window.threeRenderer.dispose();
          window.threeRenderer = null;
        } catch (e) {
          console.warn('Error cleaning up Three.js renderer:', e);
        }
      }
      if (window.threeScene) {
        try {
          window.threeScene.clear();
          window.threeScene = null;
        } catch (e) {
          console.warn('Error cleaning up Three.js scene:', e);
        }
      }
      window.threeCamera = null;
    };
  }, []);

  // Run sketch when code changes
  useEffect(() => {
    if (code && sketchContainerRef.current && isAnimationCreated) {
      // Reset any previous errors
      setCanvasError('');
      
      try {
        console.log('Running Three.js animation with code length:', code.length);
        
        // Run the Three.js sketch
        runThreeSketch(code, sketchContainerRef.current, (errorMsg: string) => {
          console.error('Three.js animation error:', errorMsg);
          setCanvasError(errorMsg);
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error running Three.js animation:', errorMessage);
        setCanvasError(errorMessage);
      }
    }
  }, [code, isAnimationCreated]);

  return (
    <div className={`flex-1 flex justify-center items-center mt-2 relative overflow-hidden min-h-[400px] max-w-full bg-pink-50 ${
      isLoading ? 'border border-pink-200 rounded-lg' : ''
    } ${
      isAnimationCreated 
        ? 'p-0 shadow-md rounded-lg' 
        : 'border border-pink-200 p-2.5 rounded-lg'
    } ${className}`}>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 text-pink-400">
          <div className="w-[50px] h-[50px] border-4 border-pink-400/20 rounded-full border-t-pink-400 animate-spin mb-5"></div>
          <p>Generating your animation...</p>
        </div>
      )}
      {!isLoading && !isAnimationCreated && !error && !canvasError && (
        <div className="flex flex-col items-center justify-center text-pink-400 h-full w-full absolute top-0 left-0 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aabdd9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-60">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M9 9h.01"></path>
            <path d="M15 9h.01"></path>
            <path d="M8 13h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8z"></path>
          </svg>
          <p className="text-base max-w-[300px] leading-relaxed">Type a description and click Create to generate an animation</p>
        </div>
      )}
      {(error || canvasError) && !isLoading && (
        <div className="flex flex-col items-center gap-2.5 text-pink-600 bg-pink-100 py-4 px-5 rounded-lg m-4 text-center shadow-sm animate-slideIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span className="font-medium text-base">{canvasError || error}</span>
        </div>
      )}
      <div 
        ref={sketchContainerRef} 
        className="flex justify-center items-center relative z-10 w-full h-full"
        data-testid="animation-container"
      ></div>
    </div>
  );
};

export default AnimationCanvas; 