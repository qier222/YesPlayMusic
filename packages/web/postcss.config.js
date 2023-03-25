/* eslint-disable @typescript-eslint/no-var-requires */
const { colord } = require('colord')
const colors = require('tailwindcss/colors')

const replaceBrandColorWithCSSVar = () => {
  const blues = Object.entries(colors.blue).map(([key, value]) => {
    const rgb = colord(value).toHsl()
    const hsl = colord(value).toHsl()
    return {
      key,
      hsl: `${hsl.h} ${hsl.s} ${hsl.l}`,
      rgb: `${rgb.r} ${rgb.g} ${rgb.b}`,
    }
  })
  return {
    postcssPlugin: 'replaceBrandColorWithCSSVar',
    Declaration(decl) {
      let value = decl.value
      blues.forEach(blue => {
        if (decl?.parent?.selector?.includes('-blue-')) {
          return
        }
        value = value.replace(`rgb(${blue.rgb}`, `hsl(var(--brand-color-${blue.key})`)
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
replaceBrandColorWithCSSVar.postcss = true

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // replaceBrandColorWithCSSVar,
  ],
}
