import 'virtual:svg-icons-register'
import '../styles/global.css'
import '../styles/accentColor.css'
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
