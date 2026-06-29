/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F5F5F7',
        'text-primary': '#1D1D1F',
        'text-secondary': '#6E6E73',
        accent: '#5B8DEF',
        'traffic-red': '#FF5F57',
        'traffic-yellow': '#FFBD2E',
        'traffic-green': '#28C840',
        'desktop-bg': '#FDE8D7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
}
