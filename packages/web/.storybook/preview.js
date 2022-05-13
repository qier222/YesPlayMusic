import 'virtual:svg-icons-register'
import '../styles/global.scss'
import '../styles/accentColor.scss'
import viewports from './viewports'

export const parameters = {
  viewport: {
    viewports,
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
