export const changeAccentColor = (color: string) => {
  document.body.setAttribute('data-accent-color', color)
}

const stateString = localStorage.getItem('state')
const stateInLocalStorage = stateString ? JSON.parse(stateString) : {}

changeAccentColor(stateInLocalStorage?.settings?.accentColor || 'blue')
