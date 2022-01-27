import { ipcMain, app } from 'electron';

export function createMpris(window) {
  const Player = require('mpris-service');
  const renderer = window.webContents;

  const player = Player({
    name: 'yesplaymusic',
    identity: 'YesPlayMusic media palyer',
  });

  player.on('next', () => renderer.send('next'));
  player.on('previous', () => renderer.send('previous'));
  player.on('playpause', () => renderer.send('play'));
  player.on('quit', () => app.exit());

  ipcMain.on('player', (e, { playing }) => {
    player.playbackStatus = playing
      ? Player.PLAYBACK_STATUS_PLAYING
      : Player.PLAYBACK_STATUS_PAUSED;
  });
  ipcMain.on('metadata', (e, metadata) => {
    player.metadata = {
      'mpris:artUrl': metadata.artwork[0].src,
      'xesam:title': metadata.title,
      'xesam:album': metadata.album,
      'xesam:artist': metadata.artist.split(','),
    };
  });
}
