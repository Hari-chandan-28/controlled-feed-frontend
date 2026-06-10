/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E8002D",
        dark: "#0a0a0a",
        surface: "#111111",
        card: "#1a1a1a",
        border: "#2a2a2a",
        muted: "#666666",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};