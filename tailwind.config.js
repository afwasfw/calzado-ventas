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
        'industrial-blue': '#1e3a8a',
        'industrial-gray': '#374151',
      },
    },
  },
  plugins: [],
}
