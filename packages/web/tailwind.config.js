/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
const pickedColors = require('./scripts/pickedColors.js')

module.exports = {
  content: ['./index.html', './**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...pickedColors,
        brand: {
          50: '#FCFFF5',
          100: '#ECFEC1',
          200: '#DCFB8F',
          300: '#CDF764',
          400: '#BFF142',
          500: '#B2E928',
          600: '#A5DE16',
          700: '#98D00B',
          800: '#8BC003',
          900: '#8BC003',
        },
        gray: colors.neutral,
      },
    },
  },
  variants: {},
}
