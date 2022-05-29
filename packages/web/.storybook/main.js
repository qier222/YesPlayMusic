const { mergeConfig } = require('vite')
const { join } = require('path')
const { createSvgIconsPlugin } = require('vite-plugin-svg-icons')

module.exports = {
  stories: [
    '../components/**/*.stories.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-postcss',
    'storybook-tailwind-dark-mode',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        /**
         * @see https://github.com/vbenjs/vite-plugin-svg-icons
         */
        createSvgIconsPlugin({
          iconDirs: [join(__dirname, '../assets/icons')],
          symbolId: 'icon-[name]',
        }),
      ],
      resolve: {
        alias: {
          '@': join(__dirname, '../../'),
        },
      },
    })
  },
}
