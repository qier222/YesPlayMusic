/* global __static */
import path from "path";
import { app, nativeImage, Tray, Menu } from "electron";

export function createTray(win) {
  let icon = nativeImage
    .createFromPath(path.join(__static, "img/icons/menu@88.png"))
    .resize({
      height: 20,
      width: 20,
    });
  let tray = new Tray(icon);

  tray.on("click", () => {
    if (win && win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  tray.on("right-click", () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          app.exit();
        },
      },
    ]);
    tray.popUpContextMenu(contextMenu);
  });

  return tray;
}
