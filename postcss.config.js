/* eslint-disable @typescript-eslint/no-var-requires */
const { colord } = require('colord')
const colors = require('tailwindcss/colors')

const replaceBrandColorWithCssVar = () => {
  const blues = Object.entries(colors.blue).map(([key, value]) => {
    const c = colord(value).toRgb()
    return {
      key,
      rgb: `${c.r} ${c.g} ${c.b}`,
    }
  })
  return {
    postcssPlugin: 'replaceBrandColorWithCssVar',
    Declaration(decl) {
      let value = decl.value
      blues.forEach(blue => {
        if (decl?.parent?.selector?.includes('-blue-')) {
          return
        }
        value = value.replace(
          `rgb(${blue.rgb}`,
          `rgb(var(--brand-color-${blue.key})`
        )
      })
      // if (decl.value !== value) {
      //   console.log({
      //     before: decl.value,
      //     after: value,
      //   })
      // }
      decl.value = value
    },
  }
}
replaceBrandColorWithCssVar.postcss = true

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    replaceBrandColorWithCssVar,
  ],
}
