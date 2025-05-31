import * as THREE from 'three';

// Extend Window interface to include Three.js instances
declare global {
  interface Window {
    threeScene: THREE.Scene | null;
    threeRenderer: THREE.WebGLRenderer | null;
    threeCamera: THREE.Camera | null;
    threeAnimationId: number | null;
  }
}

/**
 * Helper function to fix common syntax errors in Three.js code
 */
export const preprocessThreeCode = (code: string): string => {
  // Fix common syntax errors
  let fixedCode = code;
  
  // Ensure proper Three.js imports are available
  if (!fixedCode.includes('THREE')) {
    fixedCode = `const THREE = window.THREE;\n${fixedCode}`;
  }
  
  return fixedCode;
};

/**
 * Clean up existing Three.js instances
 */
const cleanupThreeInstances = () => {
  // Cancel animation loop
  if (window.threeAnimationId) {
    cancelAnimationFrame(window.threeAnimationId);
    window.threeAnimationId = null;
  }
  
  // Dispose of renderer
  if (window.threeRenderer) {
    window.threeRenderer.dispose();
    window.threeRenderer = null;
  }
  
  // Clear scene
  if (window.threeScene) {
    // Dispose of all geometries, materials, and textures
    window.threeScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    window.threeScene.clear();
    window.threeScene = null;
  }
  
  window.threeCamera = null;
};

export const runThreeSketch = (sketchCode: string, container: HTMLDivElement, onError: (error: string) => void): void => {
  // First clean up any existing Three.js instances
  cleanupThreeInstances();
  
  // Clear the container
  if (container) {
    container.innerHTML = '';
  }
  
  try {
    // Ensure THREE is available globally
    if (typeof window.THREE === 'undefined') {
      // If THREE is not available from CDN, try to use the imported THREE
      window.THREE = THREE;
    }
    
    // Preprocess sketch code to fix common syntax errors
    sketchCode = preprocessThreeCode(sketchCode);
    
    // Assign a unique ID to the container
    const containerId = 'three-sketch-container-' + Date.now();
    container.id = containerId;
    
    // Also add the common ID that user code might expect
    container.setAttribute('data-animation-container', 'true');
    
    // Get container dimensions
    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 300;
    
    // Make sure we have valid dimensions
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.warn('Container has invalid dimensions, using defaults');
    }
    
    // Execute the Three.js code directly instead of using script injection
    try {
      // Make Three.js available globally for the user code
      const THREE = window.THREE;
      
      // Create a custom document object that redirects common queries to our container
      const customDocument = {
        ...document,
        getElementById: (id: string) => {
          if (id === 'animation-container' || id === containerId) {
            return container;
          }
          return document.getElementById(id);
        },
        querySelector: (selector: string) => {
          if (selector === '#animation-container' || selector === `#${containerId}`) {
            return container;
          }
          return document.querySelector(selector);
        }
      };
      
      // Check if user code creates its own scene, camera, renderer
      const hasOwnSetup = sketchCode.includes('new THREE.Scene()') || 
                         sketchCode.includes('new THREE.WebGLRenderer()') ||
                         sketchCode.includes('new THREE.PerspectiveCamera()');
      
      if (hasOwnSetup) {
        // User code handles its own setup, just execute it
        const executeUserCode = new Function('THREE', 'document', 'window', sketchCode);
        executeUserCode(THREE, customDocument, window);
      } else {
        // Provide default scene, camera, renderer setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(containerWidth, containerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        
        // Store instances globally for cleanup
        window.threeScene = scene;
        window.threeRenderer = renderer;
        window.threeCamera = camera;
        
        // Append renderer to container
        container.appendChild(renderer.domElement);
        
        // Set up default camera position
        camera.position.z = 5;
        
        // Create a function to execute user code with proper context
        const executeUserCode = new Function('THREE', 'scene', 'camera', 'renderer', 'document', 'window', sketchCode);
        
        // Execute user code
        executeUserCode(THREE, scene, camera, renderer, customDocument, window);
        
        // Animation loop function
        let animationId: number | null = null;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          try {
            // The user code should have set up its own animation loop
            // If not, we just render the scene
            if (scene && camera && renderer) {
              renderer.render(scene, camera);
            }
          } catch (animError) {
            console.error('Error in animation loop:', animError);
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
          }
        };
        
        // Store animation ID for cleanup
        window.threeAnimationId = animationId;
        
        // Start animation loop only if user code doesn't have its own
        if (!sketchCode.includes('requestAnimationFrame') && !sketchCode.includes('animate()')) {
          animate();
          // Update the global reference after starting animation
          window.threeAnimationId = animationId;
        }
      }
      
      // Handle window resize
      const handleResize = () => {
        if (container && window.threeCamera && window.threeRenderer) {
          const newWidth = container.clientWidth;
          const newHeight = container.clientHeight;
          
          if (window.threeCamera instanceof THREE.PerspectiveCamera) {
            (window.threeCamera as THREE.PerspectiveCamera).aspect = newWidth / newHeight;
            (window.threeCamera as THREE.PerspectiveCamera).updateProjectionMatrix();
          }
          window.threeRenderer.setSize(newWidth, newHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
    } catch (e) {
      console.error('Error in Three.js sketch execution:', e);
      onError('Error running Three.js animation: ' + (e instanceof Error ? e.message : String(e)));
    }
    
    // Check if canvas was created
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        console.warn('No canvas found after running Three.js sketch');
        onError('No canvas was created. The animation might not be working correctly.');
      } else {
        // Style the canvas for responsive behavior
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
      }
    }, 1000);
    
  } catch (err) {
    console.error('Error running Three.js sketch:', err);
    onError('Error running the animation code: ' + (err instanceof Error ? err.message : String(err)));
  }
}; 