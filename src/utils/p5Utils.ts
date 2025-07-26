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
  }
  
  // Clear the container
  if (container) {
    container.innerHTML = '';
  }
  
  try {
    console.log('Running p5.js animation with code length:', sketchCode.length);
    console.log('Code preview:', sketchCode.substring(0, 200));
    
    // Use the existing container ID or assign 'animation-container' as default
    const containerId = container.id || 'animation-container';
    container.id = containerId;
    
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
    
    // Create a safer execution environment
    try {
             // Create the p5 instance with proper instance mode but bind to global scope
       window.p5Instance = new (window as any).p5((p: any) => {
         console.log('Setting up p5 instance');
         
         // Make all p5 functions globally available by binding them to window
         Object.getOwnPropertyNames(p).forEach(prop => {
           if (typeof p[prop] === 'function' && !prop.startsWith('_')) {
             try {
               (window as any)[prop] = p[prop].bind(p);
             } catch (e) {
               // Some properties might not be bindable, that's okay
             }
           }
         });
         
         // Also bind important p5 properties as getters
         const dynamicProps = ['width', 'height', 'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'frameCount', 'windowWidth', 'windowHeight'];
         dynamicProps.forEach(prop => {
           if (p.hasOwnProperty(prop) || prop in p) {
             Object.defineProperty(window, prop, {
               get: () => p[prop],
               configurable: true,
               enumerable: true
             });
           }
         });
         
         // Bind important constants
         const constants = ['TWO_PI', 'PI', 'HALF_PI', 'QUARTER_PI', 'CENTER', 'CORNER', 'CORNERS', 'RADIUS'];
         constants.forEach(constant => {
           if (p[constant] !== undefined) {
             (window as any)[constant] = p[constant];
           }
         });
         
         // Execute the user code in global context
         try {
           console.log('Executing user code with', finalSketchCode.length, 'characters');
           
           // Use eval to execute the code in the global context where all p5 functions are available
           eval(finalSketchCode);
           
           console.log('User code executed successfully');
         } catch (userCodeError) {
           console.error('Error in user p5.js code:', userCodeError);
           onError('Error in animation code: ' + (userCodeError instanceof Error ? userCodeError.message : String(userCodeError)));
         }
       }, containerId);
      
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
      }, 500);
      
    } catch (executionError) {
      console.error('Error during p5.js execution:', executionError);
      onError('Failed to execute animation: ' + (executionError instanceof Error ? executionError.message : String(executionError)));
    }
    
  } catch (err) {
    console.error('Error running p5.js sketch:', err);
    onError('Error running the animation code: ' + (err instanceof Error ? err.message : String(err)));
  }
}; 