/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-peach': '#FCE7DF', // Fondo pastel logo
        'brand-gold': '#D4B271',  // Text "FOR YOU WOMAN"
        'brand-black': '#111111', // Monograma principal
      },
    },
  },
  plugins: [],
}
