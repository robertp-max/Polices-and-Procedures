/** Designless clean baseline — neutral Tailwind defaults only.
 *  The legacy palette, glass shadows, and brand fonts have been removed
 *  deliberately so no old theme can bleed into the future V6 design.
 *  V6 defines its own tokens. */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
