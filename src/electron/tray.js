const path = require("path");
const { nativeImage, Tray } = require("electron");

function getNativeIcon(name, width = 24, height = 24) {
  return nativeImage.createFromPath(path.join(__static, 'img/icons/', name)).resize({
    width,
    height,
  })
}

let tray = new Tray(getNativeIcon('menu@88.png', 20, 20));;

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
module.exports = tray;
