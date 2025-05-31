/// <reference types="vite/client" />

// Add type declaration for the global Three.js instances
declare global {
  interface Window {
    THREE: any;
    threeScene: any;
    threeRenderer: any;
    threeCamera: any;
    threeAnimationId: number | null;
  }
} 