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
    window.p5Instance.remove();
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
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
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
          window.p5Instance.remove();
        }
        window.p5Instance = new window.p5(function(p) {
          // Store original canvas dimensions
          let originalWidth, originalHeight;
          
          // Add setup method override to ensure canvas fits container
          const originalSetup = p.setup || function() {};
          
          p.setup = function() {
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
              
              // We don't force resize here to preserve original animation dimensions
              // just store the original values
            }
          };
          
          // Add window resize handling
          p.windowResized = function() {
            const container = document.getElementById('${containerId}');
            if (container && originalWidth && originalHeight) {
              // Maintain aspect ratio
              const containerWidth = container.clientWidth;
              const containerHeight = container.clientHeight;
              
              // Don't resize the canvas - the CSS will handle the proper display
              // This allows the animation to maintain its original dimensions
            }
          };
          
          ${sketchBody}
        }, '${containerId}');
      } catch (e) {
        console.error('Error in p5.js sketch execution:', e);
      }
    `;
    
    container.appendChild(scriptElement);
    
    // Add window resize event listener
    window.addEventListener('resize', () => {
      if (window.p5Instance && typeof window.p5Instance.windowResized === 'function') {
        window.p5Instance.windowResized();
      }
    });
    
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
  } catch (err) {
    console.error('Error running p5.js sketch:', err);
    onError('Error running the animation code: ' + (err instanceof Error ? err.message : String(err)));
  }
}; 