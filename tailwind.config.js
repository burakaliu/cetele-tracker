/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bone': '#F4F2ED',
        'bone-dark': '#EBE9E2',
        'stone-light': '#E0DCD3',
        'charcoal': '#1C1C1B',
        'charcoal-soft': '#686660',
        'olive': '#3D4C38',
        'olive-hover': '#4A5D44',
        'sienna': '#B45309',
        'stone-border': '#D6D3C9',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'paper': '4px 4px 0px 0px rgba(0,0,0,0.05)',
        'paper-lg': '8px 8px 0px 0px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
