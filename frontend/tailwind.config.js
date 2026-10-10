/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        specter: {
          darkest: '#080b0e',
          bg: '#0b0e11',
          card: '#12161c',
          border: '#1f2630',
          hover: '#1b222c',
          muted: '#848e9c',
          gold: '#f0b90b',
          emerald: '#0ecb81',
          cyan: '#00f0ff',
          crimson: '#f6465d',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'ui-monospace'],
        sans: ['"Inter"', 'sans-serif', 'system-ui'],
      },
      boxShadow: {
        'neon-emerald': '0 0 15px rgba(14, 203, 129, 0.25)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'neon-gold': '0 0 15px rgba(240, 185, 11, 0.25)',
        'neon-crimson': '0 0 15px rgba(246, 70, 93, 0.25)',
      }
    },
  },
  plugins: [],
}
