/* eslint-disable @typescript-eslint/no-var-requires */
const { colord } = require('colord')
const prettier = require('prettier')
const fs = require('fs')
const prettierConfig = require('../../../prettier.config.js')
const pickedColors = require('./pickedColors.js')

const colorsCss = {}
Object.entries(pickedColors).forEach(([name, colors]) => {
  let tmp = ''
  Object.entries(colors).map(([key, value]) => {
    const c = colord(value).toHsl()
    tmp = `${tmp}
--brand-color-${key}: ${c.h} ${c.s}% ${c.l}%;`
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
fs.writeFileSync('./styles/accentColor.css', formatted)
