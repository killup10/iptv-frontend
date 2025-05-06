/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        netflixgray: "#e5e5e5",
        netflixred: "#E50914",
        netflixbg: "#141414",
      },
    },
  },
  plugins: [],
};