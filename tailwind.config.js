export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        ci: {
          teal: '#007970',
          'teal-dark': '#005c55',
          orange: '#C74600',
          red: '#D70101',
          green: '#008540',
          warning: '#FFC700',
          ink: '#1F1C1B',
          body: '#524048',
          border: '#E5E4E3',
          surface: '#FAFBF8',
        },
      },
    },
  },
  plugins: [],
}