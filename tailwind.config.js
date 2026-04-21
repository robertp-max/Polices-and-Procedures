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
        // CI-ION Premium dark palette
        ci: {
          gold:          '#FFC107',
          'gold-dark':   '#D4AF37',
          'gold-deep':   '#8C6B0A',
          maroon:        '#420808',
          'maroon-deep': '#0A0202',
          'maroon-mid':  '#310707',
          'maroon-glow': '#5D0E0E',
          // Legacy aliases kept for module compatibility
          teal:          '#FFC107',
          'teal-dark':   '#D4AF37',
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
