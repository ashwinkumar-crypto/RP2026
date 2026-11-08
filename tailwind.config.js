/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: { DEFAULT: '#5b0f24', deep: '#2a0610', rich: '#7a1530' },
        gold: { DEFAULT: '#d4a64a', light: '#f0d48a', dark: '#a87a22' },
        ivory: { DEFAULT: '#f8f0dd', dim: '#e6d9b8' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Pinyon Script"', '"Cormorant Garamond"', 'cursive'],
        cinzel: ['Cinzel', '"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
