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
          
          // Clean up global variables
          const globalVarsToClean = ['width', 'height', 'mouseX', 'mouseY', 'frameCount', 'windowWidth', 'windowHeight'];
          globalVarsToClean.forEach(varName => {
            try {
              if (window.hasOwnProperty(varName)) {
                delete window[varName];
              }
            } catch (e) {
              // Some properties might be non-configurable, ignore errors
            }
          });
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
            'resizeCanvas', 'windowResized', 'draw', 'setup', 'constrain',
            'lerpColor', 'color', 'red', 'green', 'blue', 'alpha', 'hue',
            'saturation', 'brightness', 'colorMode', 'lerp', 'dist', 'mag',
            'pow', 'sqrt', 'log', 'exp'
          ];
          
          // Create global references to p5 instance methods
          globalFunctions.forEach(funcName => {
            if (typeof p[funcName] === 'function') {
              window[funcName] = p[funcName].bind(p);
            }
          });
          
          // Global variables - safely define only if not already defined
          const safeDefineProperty = (obj, prop, descriptor) => {
            try {
              if (!obj.hasOwnProperty(prop) || obj.propertyIsEnumerable(prop)) {
                Object.defineProperty(obj, prop, descriptor);
              } else {
                // If property exists and is non-configurable, assign directly
                obj[prop] = descriptor.get ? descriptor.get() : descriptor.value;
              }
            } catch (e) {
              // Fallback: assign directly to window
              try {
                obj[prop] = descriptor.get ? descriptor.get() : descriptor.value;
              } catch (fallbackError) {
                console.warn('Could not define property', prop, fallbackError);
              }
            }
          };
          
          safeDefineProperty(window, 'width', { get: () => p.width, configurable: true });
          safeDefineProperty(window, 'height', { get: () => p.height, configurable: true });
          safeDefineProperty(window, 'mouseX', { get: () => p.mouseX, configurable: true });
          safeDefineProperty(window, 'mouseY', { get: () => p.mouseY, configurable: true });
          safeDefineProperty(window, 'frameCount', { get: () => p.frameCount, configurable: true });
          safeDefineProperty(window, 'windowWidth', { get: () => window.innerWidth, configurable: true });
          safeDefineProperty(window, 'windowHeight', { get: () => window.innerHeight, configurable: true });
          
          // Constants
          window.CENTER = p.CENTER;
          window.LEFT = p.LEFT;
          window.RIGHT = p.RIGHT;
          window.TOP = p.TOP;
          window.BOTTOM = p.BOTTOM;
          window.CORNER = p.CORNER;
          window.CORNERS = p.CORNERS;
          window.RADIUS = p.RADIUS;
          
          // Math constants
          window.PI = p.PI;
          window.TWO_PI = p.TWO_PI;
          window.HALF_PI = p.HALF_PI;
          window.QUARTER_PI = p.QUARTER_PI;
          
          // Store original setup method if it exists in user code
          let userSetup = null;
          let userDraw = null;
          let userWindowResized = null;
          let userMousePressed = null;
          let userMouseReleased = null;
          let userKeyPressed = null;
          let userKeyReleased = null;
          
          // Execute user code to capture their functions
          try {
            console.log('Executing user code (length: ${finalSketchCode.length} chars)');
            console.log('User code preview:', \`${finalSketchCode.substring(0, 200)}...\`);
            
            // Execute user code and capture functions using eval to access the local scope
            eval(\`
              ${finalSketchCode}
              
              // Explicitly attach functions to window if they exist in local scope
              if (typeof setup === 'function') {
                window.setup = setup;
              }
              if (typeof draw === 'function') {
                window.draw = draw;
              }
              if (typeof windowResized === 'function') {
                window.windowResized = windowResized;
              }
              if (typeof mousePressed === 'function') {
                window.mousePressed = mousePressed;
              }
              if (typeof mouseReleased === 'function') {
                window.mouseReleased = mouseReleased;
              }
              if (typeof keyPressed === 'function') {
                window.keyPressed = keyPressed;
              }
              if (typeof keyReleased === 'function') {
                window.keyReleased = keyReleased;
              }
            \`);
            
            // Capture user-defined functions
            if (typeof window.setup === 'function') {
              userSetup = window.setup;
              console.log('Found user setup function');
            } else {
              console.log('No user setup function found');
            }
            if (typeof window.draw === 'function') {
              userDraw = window.draw;
              console.log('Found user draw function');
            } else {
              console.log('No user draw function found');
            }
            if (typeof window.windowResized === 'function') {
              userWindowResized = window.windowResized;
              console.log('Found user windowResized function');
            }
            if (typeof window.mousePressed === 'function') {
              userMousePressed = window.mousePressed;
              console.log('Found user mousePressed function');
            }
            if (typeof window.mouseReleased === 'function') {
              userMouseReleased = window.mouseReleased;
              console.log('Found user mouseReleased function');
            }
            if (typeof window.keyPressed === 'function') {
              userKeyPressed = window.keyPressed;
              console.log('Found user keyPressed function');
            }
            if (typeof window.keyReleased === 'function') {
              userKeyReleased = window.keyReleased;
              console.log('Found user keyReleased function');
            }
          } catch (userCodeError) {
            console.error('Error in user p5.js code:', userCodeError);
            throw userCodeError;
          }
          
          // Setup method
          p.setup = function() {
            try {
              console.log('p5.js setup starting...');
              if (userSetup) {
                console.log('Running user setup function');
                userSetup();
              } else {
                console.log('No user setup found, creating default canvas');
                p.createCanvas(${containerWidth}, ${containerHeight});
              }
              
              originalWidth = p.width || ${containerWidth};
              originalHeight = p.height || ${containerHeight};
              console.log('Setup completed, canvas size:', originalWidth, 'x', originalHeight);
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
              } else {
                console.warn('No user draw function found - animation may appear blank');
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
          
          // Mouse event handlers
          p.mousePressed = function() {
            try {
              if (userMousePressed) {
                userMousePressed();
              }
            } catch (mouseError) {
              console.warn('Error in mousePressed:', mouseError);
            }
          };
          
          p.mouseReleased = function() {
            try {
              if (userMouseReleased) {
                userMouseReleased();
              }
            } catch (mouseError) {
              console.warn('Error in mouseReleased:', mouseError);
            }
          };
          
          // Key event handlers
          p.keyPressed = function() {
            try {
              if (userKeyPressed) {
                userKeyPressed();
              }
            } catch (keyError) {
              console.warn('Error in keyPressed:', keyError);
            }
          };
          
          p.keyReleased = function() {
            try {
              if (userKeyReleased) {
                userKeyReleased();
              }
            } catch (keyError) {
              console.warn('Error in keyReleased:', keyError);
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