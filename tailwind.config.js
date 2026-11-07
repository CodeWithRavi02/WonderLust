/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171827",
        violet: "#7459f6",
        mint: "#c9f3dd",
      },
    },
  },
  plugins: [],
};
