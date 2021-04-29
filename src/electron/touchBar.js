const { TouchBar, nativeImage, ipcMain } = require('electron');
const { TouchBarButton, TouchBarSpacer } = TouchBar;
const path = require('path');

export function createTouchBar(window) {
  const renderer = window.webContents;

  // Icon follow touchbar design guideline.
  // See: https://developer.apple.com/design/human-interface-guidelines/macos/touch-bar/touch-bar-icons-and-images/
  // Icon Resource: https://devimages-cdn.apple.com/design/resources/
  function getNativeIcon(name) {
    return nativeImage.createFromPath(
      // eslint-disable-next-line no-undef
      path.join(__static, 'img/touchbar/', name)
    );
  }

  const previousPage = new TouchBarButton({
    click: () => {
      renderer.send('routerGo', 'back');
    },
    icon: getNativeIcon('page_prev.png'),
  });

  const nextPage = new TouchBarButton({
    click: () => {
      renderer.send('routerGo', 'forward');
    },
    icon: getNativeIcon('page_next.png'),
  });

  const searchButton = new TouchBarButton({
    click: () => {
      renderer.send('search');
    },
    icon: getNativeIcon('search.png'),
  });

  const playButton = new TouchBarButton({
    click: () => {
      renderer.send('play');
    },
    icon: getNativeIcon('play.png'),
  });

  const previousTrackButton = new TouchBarButton({
    click: () => {
      renderer.send('previous');
    },
    icon: getNativeIcon('backward.png'),
  });

  const nextTrackButton = new TouchBarButton({
    click: () => {
      renderer.send('next');
    },
    icon: getNativeIcon('forward.png'),
  });

  const likeButton = new TouchBarButton({
    click: () => {
      renderer.send('like');
    },
    icon: getNativeIcon('like.png'),
  });

  const nextUpButton = new TouchBarButton({
    click: () => {
      renderer.send('nextUp');
    },
    icon: getNativeIcon('next_up.png'),
  });

  ipcMain.on('player', (e, { playing, likedCurrentTrack }) => {
    playButton.icon =
      playing === true ? getNativeIcon('pause.png') : getNativeIcon('play.png');
    likeButton.icon = likedCurrentTrack
      ? getNativeIcon('like_fill.png')
      : getNativeIcon('like.png');
  });

  const touchBar = new TouchBar({
    items: [
      previousPage,
      nextPage,
      searchButton,
      new TouchBarSpacer({ size: 'flexible' }),
      previousTrackButton,
      playButton,
      nextTrackButton,
      new TouchBarSpacer({ size: 'flexible' }),
      likeButton,
      nextUpButton,
    ],
  });
  return touchBar;
}
