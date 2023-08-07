import { ipcMain, app } from 'electron';

export function createMpris(window) {
  const Player = require('mpris-service');
  const renderer = window.webContents;

  const player = Player({
    name: 'yesplaymusic',
    identity: 'YesPlayMusic',
  });

  player.on('next', () => renderer.send('next'));
  player.on('previous', () => renderer.send('previous'));
  player.on('playpause', () => renderer.send('play'));
  player.on('play', () => renderer.send('play'));
  player.on('pause', () => renderer.send('play'));
  player.on('quit', () => app.exit());
  player.on('position', args =>
    renderer.send('setPosition', args.position / 1000 / 1000)
  );
  player.on('loopStatus', () => renderer.send('repeat'));
  player.on('shuffle', () => renderer.send('shuffle'));

  ipcMain.on('player', (e, { playing }) => {
    player.playbackStatus = playing
      ? Player.PLAYBACK_STATUS_PLAYING
      : Player.PLAYBACK_STATUS_PAUSED;
  });

  ipcMain.on('metadata', (e, metadata) => {
    player.metadata = {
      'mpris:trackid': player.objectPath('track/' + metadata.trackId),
      'mpris:artUrl': metadata.artwork[0].src,
      'mpris:length': metadata.length * 1000 * 1000,
      'xesam:title': metadata.title,
      'xesam:album': metadata.album,
      'xesam:artist': metadata.artist.split(','),
      'xesam:url': metadata.url,
    };
  });

  ipcMain.on('playerCurrentTrackTime', (e, position) => {
    player.getPosition = () => position * 1000 * 1000;
  });

  ipcMain.on('switchRepeatMode', (e, mode) => {
    switch (mode) {
      case 'off':
        player.loopStatus = Player.LOOP_STATUS_NONE;
        break;
      case 'one':
        player.loopStatus = Player.LOOP_STATUS_TRACK;
        break;
      case 'on':
        player.loopStatus = Player.LOOP_STATUS_PLAYLIST;
        break;
    }
  });

  ipcMain.on('switchShuffle', (e, shuffle) => {
    player.shuffle = shuffle;
  });
}
