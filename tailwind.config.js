/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#946A2E",
      },
      fontFamily: {
        urbanist: ["Urbanist", "sans-serif"],
        gentium: ["Gentium Basic", "serif"],
      },
      scrollbar: {
        width: "4px",
        thumb: {
          borderRadius: "50px",
          backgroundColor: "#eeeeee",
        },
      },
      track: {
        borderRadius: "50px",
        backgroundColor: "#946A2E",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
