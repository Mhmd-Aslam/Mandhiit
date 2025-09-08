/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#d4af37",
          dark: "#2c3e50"
        }
      }
    },
  },
  plugins: [],
};
