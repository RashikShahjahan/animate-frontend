/// <reference types="vite/client" />

// Global window interface extensions
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
    threeAnimationId: number | null;
    threeRenderer: any;
    threeScene: any;
    threeCamera: any;
  }
} 