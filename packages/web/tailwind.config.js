/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
// const pickedColors = require('./scripts/pickedColors.js')

const fontSizeDefault = {
  lineHeight: '1.2',
  letterSpacing: '0.02em',
}

module.exports = {
  content: ['./index.html', './**/*.{vue,js,ts,jsx,tsx}'],
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
          100: '#FCFCFC',
          200: '#F8F8F8',
          300: '#F4F4F4',
          400: '#F0F0F0',
          500: '#EDEDED',
          600: '#E9E9E9',
          700: '#E5E5E5',
          800: '#E2E2E2',
          900: '#DEDEDE',
        },
        night: {
          50: '#545454',
          100: '#535353',
          200: '#505050',
          300: '#484848',
          400: '#383838',
          500: '#1F1F1F',
          600: '#0E0E0E',
          700: '#060606',
          800: '#020202',
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
      },
      fontFamily: {
        mono: ['Roboto Mono', 'ui-monospace'],
      },
    },
  },
  variants: {},
}
