export const changeTheme = (theme: 'light' | 'dark') => {
  document.body.setAttribute('class', theme)
  if (!window.env?.isElectron) {
    document.documentElement.style.background =
      theme === 'dark' ? '#000' : '#fff'
  }
}

export const changeAccentColor = (color: string) => {
  document.body.setAttribute('data-accent-color', color)
}

const settingsInStorage = localStorage.getItem('settings')
const settings = settingsInStorage ? JSON.parse(settingsInStorage) : {}

changeTheme(settings.theme || 'dark')
changeAccentColor(settings?.accentColor || 'green')
