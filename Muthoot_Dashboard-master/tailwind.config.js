/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      backgroundImage: {
        headerSelected:
          "linear-gradient(0deg, rgba(255, 119, 119, 0.30) 0.21%, rgba(255, 119, 119, 0.00) 99.82%)",
        loginGrad: "url('/img/loginGrad.png')",
        background: "url('/img/background.webp')",
        greenOpaque: "linear-gradient(#90DA6E66, #90DA6E66), linear-gradient(#1C1E1FCC, #1C1E1FCC)",
      },
      animation: {
        notification:
          "scale-in .3s ease-out forwards, expand .35s .25s ease-out forwards",
        "notification-inner": "fade-in .65s ease-in forwards",
      },
      colors: {
        "m-black": "#1C1E1F",
        "m-black-light": "#242627",
        "m-black-extralight": "#2C2E2F",
        border: "#2C2E2F",
        "m-red": "#FF5252",
        "m-green": "#90DA6E",
        "m-yellow": "#FEA047",
        "m-lavender": "#5135FF",
        new: {
          black: "#000814",
          blue: "#30E6FF",
        },
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        montserrat: ["Montserrat", "Quicksand", "sans-serif"],
      },
    },
  },
  plugins: [],
};
