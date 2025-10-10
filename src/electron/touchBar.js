const { TouchBar, nativeImage, ipcMain } = require('electron');
const { TouchBarButton, TouchBarSpacer, TouchBarLabel } = TouchBar;
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

  // 歌词显示标签 - 固定宽度以最大化显示空间
  const lyricLabel = new TouchBarLabel({
    label: '♪ YesPlayMusic',
    textColor: '#FFFFFF',
  });

  ipcMain.on('player', (e, { playing, likedCurrentTrack }) => {
    playButton.icon =
      playing === true ? getNativeIcon('pause.png') : getNativeIcon('play.png');
    likeButton.icon = likedCurrentTrack
      ? getNativeIcon('like_fill.png')
      : getNativeIcon('like.png');
  });

  // 监听歌词更新
  ipcMain.on('updateLyric', (e, { lyric }) => {
    if (lyric && lyric.trim()) {
      lyricLabel.label = `♪ ${lyric}`;
    } else {
      lyricLabel.label = '♪ YesPlayMusic';
    }
  });

  const touchBar = new TouchBar({
    items: [
      previousTrackButton,
      playButton,
      nextTrackButton,
      new TouchBarSpacer({ size: 'flexible' }),
      lyricLabel,
      new TouchBarSpacer({ size: 'flexible' }),
      likeButton,
    ],
  });
  return touchBar;
}
