/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          800: '#1e293b',
          900: '#0f172a',
        },
        'sky': {
          500: '#0ea5e9',
        }
      }
    },
  },
  plugins: [],
}