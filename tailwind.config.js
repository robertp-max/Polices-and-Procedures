export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit:    ['Outfit', 'sans-serif'],
        montserrat:['Montserrat', 'sans-serif'],
        roboto:    ['Roboto', 'sans-serif'],
        mono:      ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // V3.2 command-center palette
        background: '#0B0F15',
        surface: {
          DEFAULT: '#0F131A',
          elevated: '#141A23',
        },
        border: {
          DEFAULT: '#1C2433',
          hover: '#2A3441',
          focus: '#4A5568',
        },
        brand: {
          teal: '#007970',
          orange: '#C74600',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E2E8F0',
          muted: '#8A94A6',
          disabled: '#5E6A7F',
        },
        // CI-ION Premium dark palette
        ci: {
          gold:          '#FFC107',
          'gold-dark':   '#D4AF37',
          'gold-deep':   '#8C6B0A',
          maroon:        '#420808',
          'maroon-deep': '#0A0202',
          'maroon-mid':  '#310707',
          'maroon-glow': '#5D0E0E',
          // Brand secondary (Care Indeed light kit). Use `gold` / `gold-dark` for gold — never alias `teal` to gold.
          teal:          '#007970',
          'teal-dark':   '#004142',
          orange:        '#D9A406',
          red:           '#E2463C',
          green:         '#4ade80',
          warning:       '#FFC107',
          ink:           '#E0E0E0',
          body:          '#BDBDBD',
          border:        'rgba(255,255,255,0.10)',
          surface:       '#1C0303',
        },
      },
      boxShadow: {
        'glass-panel': '0 80px 160px -40px rgba(0,0,0,0.9), 0 30px 60px -15px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-card':  '0 20px 50px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-gold':   '0 0 24px rgba(255,193,7,0.35)',
      },
    },
  },
  plugins: [],
}
