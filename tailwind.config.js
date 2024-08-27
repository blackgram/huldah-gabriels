/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#946A2E",
        nb1: "#f5f5f5",
        nb2: "#776B59",
        nb3: "#3B3B3B",
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
