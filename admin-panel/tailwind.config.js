/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      lato: ['Lato', 'sans-serif'],
      cabinet: ['"Cabinet Grotesk"', 'sans-serif'],
      sans: ['"Cabinet Grotesk"', 'sans-serif'],
    },
    extend: {
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        cabinet: ['"Cabinet Grotesk"', 'sans-serif'],
        sans: ['"Cabinet Grotesk"', 'sans-serif'],
      },
      colors: {
        'brand-bg': '#fdfcf8',
        'brand-orange': '#f39c12',
        'brand-green': '#9beb46',
        'brand-blue': '#44a0e3',
        brand: {
          blue: '#44a0e3',
          green: '#9beb46',
          orange: '#f39c12',
          dark: '#0F172A',
          light: '#fdfcf8',
        },
      },
      boxShadow: {
        'glow-orange': '0 25px 50px rgba(243,156,18,0.35)',
        'glow-blue': '0 10px 30px rgba(68,160,227,0.2)',
      },
    },
  },
  plugins: [],
};
