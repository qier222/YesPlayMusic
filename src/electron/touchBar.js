const { TouchBar, ipcMain } = require("electron");
const { TouchBarButton, TouchBarSpacer } = TouchBar;

export function createTouchBar(window) {
  const renderer = window.webContents;

  // use SF Symbols as label, you probably will see a 􀂒 instead of real icon

  const previousPage = new TouchBarButton({
    label: "􀆉",
    click: () => {
      renderer.send("routerGo", "back");
    },
  });

  const nextPage = new TouchBarButton({
    label: "􀆊",
    click: () => {
      renderer.send("routerGo", "forward");
    },
  });

  const searchButton = new TouchBarButton({
    label: "􀊫",
    click: () => {
      renderer.send("search");
    },
  });

  const playButton = new TouchBarButton({
    label: "􀊄",
    click: () => {
      renderer.send("play");
    },
  });

  const previousTrackButton = new TouchBarButton({
    label: "􀊎",
    click: () => {
      renderer.send("previous");
    },
  });

  const nextTrackButton = new TouchBarButton({
    label: "􀊐",
    click: () => {
      renderer.send("next");
    },
  });

  const likeButton = new TouchBarButton({
    label: "􀊴",
    click: () => {
      renderer.send("like");
    },
  });

  const nextUpButton = new TouchBarButton({
    label: "􀑬",
    click: () => {
      renderer.send("nextUp");
    },
  });

  ipcMain.on("player", (e, { playing, likedCurrentTrack }) => {
    playButton.label = playing === true ? "􀊆" : "􀊄";
    likeButton.label = likedCurrentTrack ? "􀊵" : "􀊴";
  });

  const touchBar = new TouchBar({
    items: [
      previousPage,
      nextPage,
      searchButton,
      new TouchBarSpacer({ size: "flexible" }),
      previousTrackButton,
      playButton,
      nextTrackButton,
      new TouchBarSpacer({ size: "flexible" }),
      likeButton,
      nextUpButton,
    ],
  });
  return touchBar;
}
