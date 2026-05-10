/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6',
          DEFAULT: '#1e3a8a', 
          dark: '#172554',
        },
        secondary: {
          light: '#10b981',
          DEFAULT: '#059669', 
          dark: '#064e3b',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        gov: {
          blue: '#1a365d',
          green: '#1b4332',
          gold: '#d4af37'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
