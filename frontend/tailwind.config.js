/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",    //Preventing dark mode from being enabled by device settings.
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto_400Regular"],
        medium: ["Roboto_500Medium"],
        bold: ["Roboto_700Bold"],
      },
      colors: {
        primary: "#152249",
        secondary: "#475569",
        primaryLight: "#3B82F6",
      },
    },
  },
  plugins: [],
};
