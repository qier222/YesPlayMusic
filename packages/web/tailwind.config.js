/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
// const pickedColors = require('./scripts/pickedColors.js')

const fontSizeDefault = {
  lineHeight: '1.2',
  letterSpacing: '0.02em',
}

module.exports = {
  content: ['./index.html', './**/*.{vue,js,ts,jsx,tsx}', '!./node_modules/**/*'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ...pickedColors,
        // brand: colors.blue,
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
          900: '#7EB000',
        },
        day: {
          50: '#B6B6B6',
          100: '#535353',
          200: '#505050',
          300: '#484848',
          400: '#383838',
          500: '#1F1F1F',
          600: '#0E0E0E',
          700: '#060606',
          800: '#020202',
        },
        night: {
          50: '#BFBFBF',
          100: '#A8A8A8',
          200: '#7B7B7B',
          300: '#606060',
          400: '#585858',
          500: '#4A4A4A',
          600: '#464646',
          700: '#3F3F3F',
          800: '#373737',
          900: '#313131',
        },
        neutral: {
          100: '#E3E3E3',
          200: '#C6C6C6',
          300: '#AAAAAA',
          400: '#8E8E8E',
          500: '#717171',
          600: '#555555',
          700: '#393939',
          800: '#1C1C1C',
        },
        gray: {
          50: '#14161A',
          100: '#14161A',
          200: '#14161A',
          300: '#14161A',
          400: '#14161A',
          500: '#14161A',
          600: '#14161A',
          700: '#14161A',
          800: '#14161A',
          900: '#0D0E10',
        },
      },
      fontSize: {
        12: ['0.75rem', fontSizeDefault],
        14: ['0.875rem', fontSizeDefault],
        16: ['1rem', fontSizeDefault],
        18: ['1.125rem', fontSizeDefault],
        21: ['1.312rem', fontSizeDefault],
        24: ['1.5rem', fontSizeDefault],
        28: ['1.75rem', fontSizeDefault],
        32: ['2rem', fontSizeDefault],
        36: ['2.25rem', fontSizeDefault],
        42: ['2.625rem', fontSizeDefault],
        48: ['3rem', fontSizeDefault],
        55: ['3.438rem', fontSizeDefault],
        63: ['3.938rem', fontSizeDefault],
        72: ['4.5rem', fontSizeDefault],
        82: ['5.125rem', fontSizeDefault],
      },
      borderRadius: {
        12: '12px',
        20: '20px',
        24: '24px',
        48: '48px',
      },
      fontFamily: {
        mono: ['Roboto Mono', 'ui-monospace'],
      },
      margin: {
        7.5: '1.875rem',
      },
      transitionDuration: {
        400: '400ms',
      },
      opacity: {
        5: '0.05',
        15: '.15',
        25: '.25',
      },
      backdropBlur: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '20px',
        '3xl': '45px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
