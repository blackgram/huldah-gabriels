/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#946A2E'
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
        gentium: ['Gentium Basic', 'serif'],
      }
    },
  },
  plugins: [],
}

