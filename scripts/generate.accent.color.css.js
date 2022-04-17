/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
const { colord } = require('colord')
const prettier = require('prettier')
const fs = require('fs')
const prettierConfig = require('../prettier.config.js')

const pickedColors = {
  blue: colors.blue,
  red: colors.red,
  orange: colors.orange,
  amber: colors.amber,
  yellow: colors.yellow,
  lime: colors.lime,
  green: colors.green,
  emerald: colors.emerald,
  teal: colors.teal,
  cyan: colors.cyan,
  sky: colors.sky,
  indigo: colors.indigo,
  violet: colors.violet,
  purple: colors.purple,
  fuchsia: colors.fuchsia,
  pink: colors.pink,
  rose: colors.rose,
}

const colorsCss = {}
Object.entries(pickedColors).forEach(([name, colors]) => {
  let tmp = ''
  Object.entries(colors).map(([key, value]) => {
    const c = colord(value).toRgb()
    tmp = `${tmp}
--brand-color-${key}: ${c.r} ${c.g} ${c.b};`
  })
  colorsCss[name] = tmp
})

let css = ''
Object.entries(colorsCss).forEach(([name, color]) => {
  css = `${css}
${name === 'blue' ? ':root' : `[data-accent-color='${name}']`} {${color}
}
`
})

const formatted = prettier.format(css, { ...prettierConfig, parser: 'css' })
fs.writeFileSync('./src/renderer/styles/accentColor.scss', formatted)
