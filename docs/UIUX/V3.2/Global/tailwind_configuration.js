/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App Backgrounds
        background: '#0B0F15',
        surface: {
          DEFAULT: '#0F131A', // Sidebar/Header
          elevated: '#141A23', // Cards/Modals
        },
        // Borders and Dividers
        border: {
          DEFAULT: '#1C2433', // Standard borders
          hover: '#2A3441',   // Interactive borders
          focus: '#4A5568',
        },
        // Semantic Brand Colors
        brand: {
          teal: '#007970',     // Primary action, complete, audit ready
          orange: '#C74600',   // Alert, blocked, critical
        },
        // Typography
        text: {
          primary: '#FFFFFF',
          secondary: '#E2E8F0', // Slate-200 equivalent
          muted: '#8A94A6',     // Subtitles, metadata
          disabled: '#5E6A7F',  // Inactive icons, empty states
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}