// Extend Window interface to include p5Instance
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
  }
}

/**
 * Note: Preprocessing is now handled on the backend for better reliability
 * This function is kept for backwards compatibility but is no longer used
 */
export const preprocessP5Code = (code: string): string => {
  // Preprocessing is now done on the backend
  return code;
};

export const runP5Sketch = (sketchCode: string, container: HTMLDivElement, onError: (error: string) => void): void => {
  // First clean up any existing p5 instance
  if (window.p5Instance) {
    try {
      window.p5Instance.remove();
    } catch (e) {
      console.warn('Error while removing previous p5 instance:', e);
    }
    window.p5Instance = null;
    
    // Clean up global variables to prevent conflicts
    const globalVarsToClean = ['width', 'height', 'mouseX', 'mouseY', 'frameCount', 'windowWidth', 'windowHeight'];
    globalVarsToClean.forEach(varName => {
      try {
        if (window.hasOwnProperty(varName)) {
          delete window[varName as any];
        }
      } catch (e) {
        // Some properties might be non-configurable, ignore errors
      }
    });
  }
  
  // Clear the container
  if (container) {
    container.innerHTML = '';
  }
  
  try {
    // Code is now preprocessed on the backend for better reliability
    console.log('Received p5.js code length:', sketchCode.length);
    console.log('Code preview:', sketchCode.substring(0, 200));
    
    // Use the existing container ID or assign 'animation-container' as default
    const containerId = container.id || 'animation-container';
    container.id = containerId;
    
    // Get container dimensions
    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 300;
    
    // Make sure we have valid dimensions
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.warn('Container has invalid dimensions, using defaults');
    }
    
    // Check if the code is already wrapped in the p5 constructor format
    const isWrappedFormat = sketchCode.includes('new p5(function(p)') || sketchCode.includes('new p5((p)');
    
    let finalSketchCode: string;
    
    if (isWrappedFormat) {
      // Handle the wrapped format (legacy)
      const functionBodyMatch = sketchCode.match(/new p5\(function\(p\) \{([\s\S]*)\}\);?$/);
      
      if (!functionBodyMatch || !functionBodyMatch[1]) {
        throw new Error('Invalid wrapped sketch code format');
      }
      
      finalSketchCode = functionBodyMatch[1];
    } else {
      // Handle raw p5.js code (new format)
      finalSketchCode = sketchCode;
    }
    
    // Create the script to execute - using global mode for simplicity
    const scriptElement = document.createElement('script');
    scriptElement.textContent = `
      try {
        if (window.p5Instance) {
          try {
            window.p5Instance.remove();
          } catch (e) {
            console.warn('Error removing existing p5 instance:', e);
          }
          window.p5Instance = null;
        }
        
        // Use global mode - much simpler, all p5 functions automatically available
        window.p5Instance = new window.p5(function() {
          // Store canvas dimensions for resize handling
          let originalWidth, originalHeight;
          
          // Execute user code directly - global mode handles everything automatically
          try {
            console.log('Executing user code in global mode (length: ${finalSketchCode.length} chars)');
            console.log('Code preview:', \`${finalSketchCode.substring(0, 200)}...\`);
            
            // Simply execute the user code - p5.js global mode will handle setup/draw automatically
            eval(\`${finalSketchCode}\`);
            
            console.log('User code executed successfully');
          } catch (userCodeError) {
            console.error('Error in user p5.js code:', userCodeError);
            throw userCodeError;
          }
          
        }, '${containerId}');
      } catch (e) {
        console.error('Error in p5.js sketch execution:', e);
        throw e;
      }
    `;
    
    container.appendChild(scriptElement);
    
    // Add window resize event listener
    const resizeHandler = () => {
      if (window.p5Instance && typeof window.p5Instance.windowResized === 'function') {
        try {
          window.p5Instance.windowResized();
        } catch (e) {
          console.warn('Error in resize handler:', e);
        }
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Check if canvas was created
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        console.warn('No canvas found after running p5.js sketch');
        console.log('Container contents:', container.innerHTML);
        console.log('p5 instance state:', window.p5Instance ? 'exists' : 'missing');
        onError('Animation failed to render. Please try regenerating the animation.');
      } else {
        console.log('Canvas successfully created:', canvas);
        // Style the canvas for responsive behavior
        canvas.style.width = 'auto';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.margin = '0 auto';
        canvas.style.display = 'block';
      }
    }, 1000);
    
    // Handle script load errors
    scriptElement.onerror = (event) => {
      console.error('Script loading error:', event);
      onError('Failed to load animation script');
    };
    
  } catch (err) {
    console.error('Error running p5.js sketch:', err);
    onError('Error running the animation code: ' + (err instanceof Error ? err.message : String(err)));
  }
}; 