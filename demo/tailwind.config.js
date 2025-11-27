/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",
    "../src/components/**/*.{js,ts,jsx,tsx}",
    "../src/presets/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
}
