/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
      sans: ['Poppins', 'sans-serif'],
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1A6bc4',   // Royal blue from 'Kingsol'
          green: '#78C257',  // Leaf green from the logo ecosystem
          orange: '#F39C12', // Sun orange from the solar panel accent
          dark: '#0F172A',   // Clean dark slate for high-contrast text
          light: '#FDFCF8',  // Pristine background white/cream
        },
        'brand-light': '#FDFCF8',
        'brand-orange': '#F39C12',
        'brand-green': '#78C257',
        'brand-blue': '#1A6bc4',
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde047',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        industrial: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
    },
  },
  plugins: [],
}
