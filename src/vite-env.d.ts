/// <reference types="vite/client" />

// Global window interface extensions for p5.js
declare global {
  interface Window {
    p5Instance: any;
    p5: any;
  }
} 