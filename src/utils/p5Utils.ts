// Extend Window interface to include p5Instance
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
    // Add support for p5 add-ons
    p5Sound?: any;
    p5GUI?: any;
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

// Keep track of event listeners for proper cleanup
let resizeHandler: (() => void) | null = null;

// More comprehensive list of p5 constants and properties to bind
const P5_CONSTANTS = [
  'TWO_PI', 'PI', 'HALF_PI', 'QUARTER_PI', 'TAU',
  'CENTER', 'CORNER', 'CORNERS', 'RADIUS',
  'RGB', 'HSB', 'HSL',
  'BLEND', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'MULTIPLY', 'EXCLUSION', 'SCREEN', 'REPLACE', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN', 'ADD', 'NORMAL',
  'THRESHOLD', 'GRAY', 'OPAQUE', 'INVERT', 'POSTERIZE', 'DILATE', 'ERODE', 'BLUR',
  'ARROW', 'CROSS', 'HAND', 'MOVE', 'TEXT', 'WAIT',
  'CLOSE', 'OPEN',
  'CHORD', 'PIE',
  'PROJECT', 'SQUARE', 'ROUND',
  'MITER', 'BEVEL',
  'POINTS', 'LINES', 'TRIANGLES', 'TRIANGLE_FAN', 'TRIANGLE_STRIP', 'QUADS', 'QUAD_STRIP',
  'TESS',
  'IMMEDIATE', 'IMAGE', 'TEXTURE',
  'CLAMP', 'REPEAT', 'MIRROR',
  'NEAREST', 'LINEAR',
  'LANDSCAPE', 'PORTRAIT',
  'GRID', 'AXES',
  'P2D', 'WEBGL'
];

const P5_DYNAMIC_PROPS = [
  'width', 'height', 'mouseX', 'mouseY', 'pmouseX', 'pmouseY',
  'frameCount', 'deltaTime', 'windowWidth', 'windowHeight',
  'mouseIsPressed', 'keyIsPressed', 'key', 'keyCode',
  'pixels', 'mouseButton', 'movedX', 'movedY'
];

export const runP5Sketch = (sketchCode: string, container: HTMLDivElement, onError: (error: string) => void): void => {
  // Clean up previous instance and event listeners
  if (window.p5Instance) {
    try {
      window.p5Instance.remove();
    } catch (e) {
      console.warn('Error while removing previous p5 instance:', e);
    }
    window.p5Instance = null;
  }
  
  // Clean up previous resize handler
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
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
        
        // More comprehensive function binding - bind ALL p5 functions except private ones
        const boundFunctions = new Set<string>();
        
        // Get all properties from the p5 instance (including inherited ones)
        let currentObj = p;
        while (currentObj && currentObj !== Object.prototype) {
          Object.getOwnPropertyNames(currentObj).forEach(prop => {
            if (typeof p[prop] === 'function' && 
                !prop.startsWith('_') && 
                !prop.startsWith('constructor') &&
                !boundFunctions.has(prop)) {
              try {
                (window as any)[prop] = p[prop].bind(p);
                boundFunctions.add(prop);
              } catch (e) {
                // Some properties might not be bindable, that's okay
                console.warn(`Could not bind function: ${prop}`, e);
              }
            }
          });
          currentObj = Object.getPrototypeOf(currentObj);
        }
        
        // Bind p5 constants more comprehensively
        P5_CONSTANTS.forEach(constant => {
          if (p[constant] !== undefined) {
            (window as any)[constant] = p[constant];
          }
        });
        
        // Bind dynamic properties with getters
        P5_DYNAMIC_PROPS.forEach(prop => {
          if (p.hasOwnProperty(prop) || prop in p) {
            Object.defineProperty(window, prop, {
              get: () => p[prop] || (prop === 'windowWidth' ? window.innerWidth : prop === 'windowHeight' ? window.innerHeight : undefined),
              set: (value) => { p[prop] = value; }, // Allow setting for some properties
              configurable: true,
              enumerable: true
            });
          }
        });
        
        // Special handling for common p5 objects/arrays
        if (p.pixels) {
          Object.defineProperty(window, 'pixels', {
            get: () => p.pixels,
            set: (value) => { p.pixels = value; },
            configurable: true,
            enumerable: true
          });
        }
        
        // Bind p5 add-on libraries if available
        if ((window as any).p5 && (window as any).p5.SoundFile) {
          console.log('p5.sound detected, binding sound functions');
          // p5.sound is available, bind its functions too
        }
        
        // Execute the user code in global context
        try {
          console.log('Executing user code with', finalSketchCode.length, 'characters');
          
          // Ensure windowWidth and windowHeight are available before executing user code
          (window as any).windowWidth = p.windowWidth || window.innerWidth;
          (window as any).windowHeight = p.windowHeight || window.innerHeight;
          
          // Use eval to execute the code in the global context where all p5 functions are available
          eval(finalSketchCode);
          
          console.log('User code executed successfully');
        } catch (userCodeError) {
          console.error('Error in user p5.js code:', userCodeError);
          onError('Error in animation code: ' + (userCodeError instanceof Error ? userCodeError.message : String(userCodeError)));
        }
      }, containerId);
      
      // Add window resize event listener with proper cleanup tracking
      resizeHandler = () => {
        if (window.p5Instance && typeof window.p5Instance.windowResized === 'function') {
          try {
            window.p5Instance.windowResized();
          } catch (e) {
            console.warn('Error in resize handler:', e);
          }
        }
      };
      
      window.addEventListener('resize', resizeHandler);
      
      // Check if canvas was created with more robust detection
      setTimeout(() => {
        const canvas = container.querySelector('canvas') || container.querySelector('svg');
        if (!canvas) {
          console.warn('No canvas or SVG found after running p5.js sketch');
          console.log('Container contents:', container.innerHTML);
          console.log('p5 instance state:', window.p5Instance ? 'exists' : 'missing');
          console.log('Available functions:', Object.keys(window).filter(key => typeof (window as any)[key] === 'function' && key.includes('create')));
          onError('Animation failed to render. Please try regenerating the animation.');
        } else {
          console.log('Render element successfully created:', canvas.tagName);
          console.log('Canvas dimensions:', canvas.getAttribute('width'), 'x', canvas.getAttribute('height'));
          // Style the canvas/svg for responsive behavior
          if (canvas.tagName === 'CANVAS') {
            canvas.style.width = 'auto';
            canvas.style.height = 'auto';
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.margin = '0 auto';
            canvas.style.display = 'block';
          }
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

// Enhanced cleanup function for better memory management
export const cleanupP5Instance = (): void => {
  if (window.p5Instance) {
    try {
      window.p5Instance.remove();
    } catch (e) {
      console.warn('Error cleaning up p5 instance:', e);
    }
    window.p5Instance = null;
  }
  
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  
  // Clean up global variables more comprehensively
  const globalVarsToClean = [
    ...P5_DYNAMIC_PROPS,
    ...P5_CONSTANTS,
    'setup', 'draw', 'preload', 'windowResized', 'mousePressed', 'mouseReleased',
    'mouseMoved', 'mouseDragged', 'mouseClicked', 'doubleClicked', 'mouseWheel',
    'keyPressed', 'keyReleased', 'keyTyped'
  ];
  
  globalVarsToClean.forEach(varName => {
    try {
      if ((window as any).hasOwnProperty(varName)) {
        delete (window as any)[varName];
      }
    } catch (e) {
      // Some properties might be non-configurable, ignore errors
    }
  });
}; 