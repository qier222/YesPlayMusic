export const changeAccentColor = (color: string) => {
  document.body.setAttribute('data-accent-color', color)
}

const stateString = localStorage.getItem('state')
const state = stateString ? JSON.parse(stateString) : {}

changeAccentColor(state.settings.accentColor || 'blue')
