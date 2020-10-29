const path = require('path')
const { Menu, Tray } = require('electron')

let tray = null

const macIcon = path.join(__static, "img/icons/menu.png")
const winIcon = path.join(__static, "img/icons/icon.ico")

tray = new Tray(macIcon)

// Temporary no need for menu.
// const contextMenu = Menu.buildFromTemplate([
//   { label: 'Item1', type: 'radio' },
//   { label: 'Item2', type: 'radio' }
// ])

// Make a change to the context menu
// contextMenu.items[1].checked = false

// tray.setToolTip('Yes Play Music')

// Call this again for Linux because we modified the context menu
// tray.setContextMenu(contextMenu)
module.exports = tray