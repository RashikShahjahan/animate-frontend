import React, { useEffect, useRef } from 'react';
import { runP5Sketch } from '../utils/p5Utils';

interface AnimationCanvasProps {
  isLoading: boolean;
  isAnimationCreated: boolean;
  code: string;
  error: string;
}

const AnimationCanvas: React.FC<AnimationCanvasProps> = ({ 
  isLoading, 
  isAnimationCreated, 
  code, 
  error 
}) => {
  const sketchContainerRef = useRef<HTMLDivElement>(null);
  
  // Clean up any previous p5 instance when component unmounts or before creating a new one
  useEffect(() => {
    return () => {
      if (window.p5Instance) {
        window.p5Instance.remove();
      }
    };
  }, []);

  // Run sketch when code changes
  useEffect(() => {
    if (code && sketchContainerRef.current && isAnimationCreated) {
      const setError = (errorMsg: string) => {
        console.error(errorMsg);
      };
      runP5Sketch(code, sketchContainerRef.current, setError);
    }
  }, [code, isAnimationCreated]);

  return (
    <div className={`flex-1 flex justify-center items-center mt-2 relative overflow-hidden min-h-[300px] max-w-full bg-pink-50 ${
      isLoading ? 'border border-pink-200 rounded-lg' : ''
    } ${
      isAnimationCreated 
        ? 'p-0 shadow-md rounded-lg' 
        : 'border border-pink-200 p-2.5 rounded-lg'
    }`}>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 text-pink-400">
          <div className="w-[50px] h-[50px] border-4 border-pink-400/20 rounded-full border-t-pink-400 animate-spin mb-5"></div>
          <p>Generating your animation...</p>
        </div>
      )}
      {!isLoading && !isAnimationCreated && !error && (
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
      <div ref={sketchContainerRef} className="flex justify-center items-center relative z-10 w-full h-full"></div>
    </div>
  );
};

export default AnimationCanvas; 