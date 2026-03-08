/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flame: "#FF6B35",
        charcoal: "#1A1A2E",
        smoke: "#E0E0E0",
      },
      fontFamily: {
        mono: ['"Fira Code"', "monospace"],
      },
    },
  },
  plugins: [],
};
