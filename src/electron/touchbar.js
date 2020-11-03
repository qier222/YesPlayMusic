const { TouchBar, nativeImage, ipcMain } = require("electron");
const path = require("path");

const {
  TouchBarButton,
  TouchBarGroup,
  TouchBarSpacer,
  TouchBarSegmentedControl,
} = TouchBar;

function getNativeIcon(name, width = 24, height = 24) {
  return nativeImage
    .createFromPath(path.join(__static, "img/icons/touchbar/", name))
    .resize({
      width,
      height,
    });
}

export function createSegmentedControl(renderer) {
  const segments = [
    {
      icon: getNativeIcon("previous.png"),
    },
    {
      icon: getNativeIcon("play.png", 20, 20),
    },
    {
      icon: getNativeIcon("next.png"),
    },
  ];
  const segmentedControl = new TouchBarSegmentedControl({
    segments,
    change: (selectedIndex) => {
      const temp = Object.assign([], segmentedControl.segments);
      if (selectedIndex === 0) {
        renderer.send("previous");
      }
      if (selectedIndex === 1) {
        ipcMain.on("vuex-state", (e, { player }) => {
          const playing = player.playing;
          if (playing === true) {
            // To be paused
            temp[1].icon = getNativeIcon("play.png", 20, 20);
            segmentedControl.segments = temp;
          } else {
            temp[1].icon = getNativeIcon("play.png", 20, 20);
            segmentedControl.segments = temp;
          }
        });
        renderer.send("play");
      }
      if (selectedIndex === 2) {
        renderer.send("next");
      }
    },
    mode: "buttons",
  });
  return segmentedControl;
}

export function createPreferGroup(renderer) {
  const search = new TouchBarButton({
    icon: getNativeIcon("search.png", 22, 22),
    click: () => {
      renderer.send("search");
    },
  });
  const like = new TouchBarButton({
    icon: getNativeIcon("like.png"),
    click: () => {
      ipcMain.on("vuex-state", (e, { liked, player }) => {
        const currentTrack = player.currentTrack;
        if (liked.songs.includes(currentTrack.id)) {
          like.icon = getNativeIcon("liked.png");
        } else {
          like.icon = getNativeIcon("like.png");
        }
      });
      renderer.send("like");
    },
  });
  const repeat = new TouchBarButton({
    icon: getNativeIcon("repeat.png"),
    click: () => {
      ipcMain.on("vuex-state", (e, { player }) => {
        const repeat = player.repeat;
        if (repeat === "on") {
          repeat.icon = getNativeIcon("repeat.png");
        } else if (repeat === "one") {
          repeat.icon = getNativeIcon("repeat.png");
        } else {
          repeat.icon = getNativeIcon("repeat.png");
        }
      });
      renderer.send("repeat");
    },
  });
  const shuffle = new TouchBarButton({
    icon: getNativeIcon("shuffle.png"),
    click: () => {
      ipcMain.on("vuex-state", (e, { player }) => {
        const shuffle = player.shuffle;
        if (shuffle === true) {
          shuffle.icon = getNativeIcon("shuffle.png");
        } else {
          shuffle.icon = getNativeIcon("shuffle.png");
        }
      });
      renderer.send("shuffle");
    },
  });
  return new TouchBar({
    items: [search, like, repeat, shuffle],
  });
}

export function createTouchBar(window) {
  const renderer = window.webContents;
  const segmentedControl = createSegmentedControl(renderer);
  const preferGroup = createPreferGroup(renderer);
  const touchBar = new TouchBar({
    items: [
      new TouchBarGroup({ items: preferGroup }),
      new TouchBarSpacer({ size: "large" }),
      segmentedControl,
      new TouchBarSpacer({ size: "large" }),
    ],
  });
  return touchBar;
}
