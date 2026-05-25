/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefdf5',
          100: '#fefaeb',
          200: '#fcf3cd',
          300: '#f9e9a5',
          400: '#f5d975',
          500: '#f1c453',
          600: '#e6a83b',
          700: '#d18a2e',
          800: '#a96b2a',
          900: '#8a5426',
        }
      },
      animation: {
        scroll: 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
