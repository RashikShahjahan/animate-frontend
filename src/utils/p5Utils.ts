// Extend Window interface to include p5Instance
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
  }
}

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
    
    // Extract the p5 function from the sketch code
    // The API returns code in format: new p5(function(p) { ... });
    const functionBodyMatch = sketchCode.match(/new p5\(function\(p\) \{([\s\S]*)\}\);?$/);
    
    if (!functionBodyMatch || !functionBodyMatch[1]) {
      throw new Error('Invalid sketch code format');
    }
    
    const sketchBody = functionBodyMatch[1];
    
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
          
          // Add setup method override to ensure canvas fits container
          const originalSetup = p.setup || function() {};
          
          p.setup = function() {
            try {
              originalSetup.call(p);
              
              // If createCanvas wasn't called in the original setup
              if (!p.canvas) {
                p.createCanvas(${containerWidth}, ${containerHeight});
                originalWidth = ${containerWidth};
                originalHeight = ${containerHeight};
              } else {
                // Store original dimensions before resizing
                originalWidth = p.width || ${containerWidth};
                originalHeight = p.height || ${containerHeight};
              }
            } catch (setupError) {
              console.error('Error in p5.js setup:', setupError);
            }
          };
          
          // Add window resize handling
          p.windowResized = function() {
            try {
              const container = document.getElementById('${containerId}');
              if (container && originalWidth && originalHeight) {
                // Maintain aspect ratio
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
              }
            } catch (resizeError) {
              console.warn('Error in windowResized:', resizeError);
            }
          };
          
          // Add error handling to preload
          const originalPreload = p.preload || function() {};
          p.preload = function() {
            try {
              originalPreload.call(p);
            } catch (preloadError) {
              console.error('Error in p5.js preload:', preloadError);
            }
          };
          
          // Handle external resources with CORS errors
          p.httpGet = function(url, datatype, callback) {
            // Check if URL is from domains that might have CORS issues
            const corsProblematicDomains = ['placekitten.com', 'imgur.com', 'giphy.com'];
            
            // If the URL contains a problematic domain, use a CORS proxy
            if (corsProblematicDomains.some(domain => url.includes(domain))) {
              console.warn('Using CORS-safe alternative for external resource:', url);
              // Use a CORS-friendly placeholder instead
              url = 'https://via.placeholder.com/800x600';
            }
            
            return p._httpGet(url, datatype, callback);
          };
          
          ${sketchBody}
        }, '${containerId}');
      } catch (e) {
        console.error('Error in p5.js sketch execution:', e);
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
        // Keep original dimensions but let CSS handle the sizing
        canvas.style.width = 'auto';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.margin = '0 auto';
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