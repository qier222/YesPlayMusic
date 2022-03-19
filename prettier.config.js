module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  semi: false,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'strict',
  singleQuote: true,
  jsxSingleQuote: true,

  // Tailwind CSS
  plugins: [require('prettier-plugin-tailwindcss')],
  tailwindConfig: './tailwind.config.js',
}
