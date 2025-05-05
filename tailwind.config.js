/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'dotPulse 1.4s infinite ease-in-out',
        'spin': 'spin 1s linear infinite',
        'slideIn': 'slideIn 0.3s ease',
      },
      keyframes: {
        dotPulse: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.6' },
          '40%': { transform: 'scale(1.2)', opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionProperty: {
        'height': 'height',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-200': {
          'animation-delay': '0.2s',
        },
        '.animation-delay-400': {
          'animation-delay': '0.4s',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}; 