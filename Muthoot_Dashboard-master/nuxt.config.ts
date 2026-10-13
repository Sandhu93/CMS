// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || "http://localhost:5002",
      batteryVoltage: 11.8,
      api: process.env.API_URL || "http://localhost:5002",
    },
  },
  modules: ["@pinia/nuxt", "@kevinmarrec/nuxt-pwa"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  ssr: false,
  devtools: { enabled: true },
});
