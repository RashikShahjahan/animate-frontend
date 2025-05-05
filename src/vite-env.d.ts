/// <reference types="vite/client" />

// Add type declaration for the global p5 instance
declare global {
  interface Window {
    p5: any;
    p5Instance: any;
  }
} 