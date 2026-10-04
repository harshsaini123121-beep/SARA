/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          800: '#1C2541',
          700: '#2A365C',
          600: '#3A4A7C',
        },
        emergency: {
          red: '#EF4444',
          orange: '#F97316',
          amber: '#F59E0B',
          green: '#10B981',
          blue: '#3B82F6',
          cyan: '#06B6D4'
        }
      }
    },
  },
  plugins: [],
}
