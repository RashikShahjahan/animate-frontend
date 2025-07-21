// Extend Window interface to include p5Instance
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
  }
}

/**
 * Helper function to fix common syntax errors in p5 sketch code
 */
export const preprocessP5Code = (code: string): string => {
  // Fix common syntax errors
  let fixedCode = code;
  
  // Fix missing closing brackets in array access with property assignment
  // e.g., array[i.property = value; -> array[i].property = value;
  fixedCode = fixedCode.replace(/(\w+)\[(\w+)\.(\w+)\s*(\+|-|\*|\/|)=\s*([^;]+);/g, 
                               "$1[$2].$3 $4= $5;");
  
  return fixedCode;
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
    // Preprocess sketch code to fix common syntax errors
    sketchCode = preprocessP5Code(sketchCode);
    
    // Assign a unique ID to the container
    const containerId = 'p5-sketch-container-' + Date.now();
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
    
    // Create the script to execute
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
        
        window.p5Instance = new window.p5(function(p) {
          // Store original canvas dimensions
          let originalWidth, originalHeight;
          
          // Override p5.js global functions to work in instance mode
          const globalFunctions = [
            'createCanvas', 'background', 'fill', 'stroke', 'noStroke', 'noFill',
            'strokeWeight', 'rect', 'ellipse', 'line', 'point', 'triangle',
            'quad', 'arc', 'circle', 'square', 'textAlign', 'textSize', 'text',
            'random', 'floor', 'ceil', 'round', 'abs', 'min', 'max', 'map',
            'noise', 'sin', 'cos', 'tan', 'atan2', 'degrees', 'radians',
            'push', 'pop', 'translate', 'rotate', 'scale', 'frameRate',
            'mousePressed', 'mouseReleased', 'keyPressed', 'keyReleased',
            'resizeCanvas', 'windowResized', 'draw', 'setup'
          ];
          
          // Create global references to p5 instance methods
          globalFunctions.forEach(funcName => {
            if (typeof p[funcName] === 'function') {
              window[funcName] = p[funcName].bind(p);
            }
          });
          
          // Global variables
          Object.defineProperty(window, 'width', { get: () => p.width });
          Object.defineProperty(window, 'height', { get: () => p.height });
          Object.defineProperty(window, 'mouseX', { get: () => p.mouseX });
          Object.defineProperty(window, 'mouseY', { get: () => p.mouseY });
          Object.defineProperty(window, 'frameCount', { get: () => p.frameCount });
          Object.defineProperty(window, 'windowWidth', { get: () => window.innerWidth });
          Object.defineProperty(window, 'windowHeight', { get: () => window.innerHeight });
          
          // Constants
          window.CENTER = p.CENTER;
          window.LEFT = p.LEFT;
          window.RIGHT = p.RIGHT;
          window.TOP = p.TOP;
          window.BOTTOM = p.BOTTOM;
          window.CORNER = p.CORNER;
          window.CORNERS = p.CORNERS;
          window.RADIUS = p.RADIUS;
          
          // Store original setup method if it exists in user code
          let userSetup = null;
          let userDraw = null;
          let userWindowResized = null;
          
          // Execute user code to capture their functions
          try {
            ${finalSketchCode}
            
            // Capture user-defined functions
            if (typeof window.setup === 'function') {
              userSetup = window.setup;
            }
            if (typeof window.draw === 'function') {
              userDraw = window.draw;
            }
            if (typeof window.windowResized === 'function') {
              userWindowResized = window.windowResized;
            }
          } catch (userCodeError) {
            console.error('Error in user p5.js code:', userCodeError);
            throw userCodeError;
          }
          
          // Setup method
          p.setup = function() {
            try {
              if (userSetup) {
                userSetup();
              } else {
                // Default setup if user didn't provide one
                p.createCanvas(${containerWidth}, ${containerHeight});
              }
              
              originalWidth = p.width || ${containerWidth};
              originalHeight = p.height || ${containerHeight};
            } catch (setupError) {
              console.error('Error in p5.js setup:', setupError);
              throw setupError;
            }
          };
          
          // Draw method
          p.draw = function() {
            try {
              if (userDraw) {
                userDraw();
              }
            } catch (drawError) {
              console.error('Error in p5.js draw:', drawError);
              // Don't rethrow draw errors to prevent animation from stopping
            }
          };
          
          // Window resize handling
          p.windowResized = function() {
            try {
              if (userWindowResized) {
                userWindowResized();
              } else {
                // Default resize behavior
                const container = document.getElementById('${containerId}');
                if (container && originalWidth && originalHeight) {
                  const containerWidth = container.clientWidth;
                  const containerHeight = container.clientHeight;
                  p.resizeCanvas(containerWidth, containerHeight);
                }
              }
            } catch (resizeError) {
              console.warn('Error in windowResized:', resizeError);
            }
          };
          
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
        onError('No canvas was created. The animation might not be working correctly.');
      } else {
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