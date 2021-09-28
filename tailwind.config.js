const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fe',
          100: '#ebeffd',
          200: '#ccd7fa',
          300: '#adbff7',
          400: '#708ef0',
          500: '#335eea',
          600: '#2e55d3',
          700: '#2647b0',
          800: '#1f388c',
          900: '#192e73',
        },
        gray: colors.neutral,
      },
    },
  },
  variants: {},
}
