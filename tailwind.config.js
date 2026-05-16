/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050505',
          green: '#00ff41',
          purple: '#bc13fe',
          glow: 'rgba(0, 255, 65, 0.5)',
        }
      },
      animation: {
        'matrix': 'matrix 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1.2) drop-shadow(0 0 10px #00ff41)' },
          '50%': { opacity: 0.8, filter: 'brightness(1) drop-shadow(0 0 5px #00ff41)' },
        }
      }
    },
  },
  plugins: [],
}
