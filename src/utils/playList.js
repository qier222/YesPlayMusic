import router from '../router';
import state from '../store/state';

export function hasListSource() {
  return !state.player.isPersonalFM && state.player.playlistSource.id !== 0;
}

export function goToListSource() {
  router.push({ path: getListSourcePath() });
}

export function getListSourcePath() {
  if (state.player.playlistSource.id === state.data.likedSongPlaylistID) {
    return '/library/liked-songs';
  } else if (state.player.playlistSource.type === 'url') {
    return state.player.playlistSource.id;
  } else if (state.player.playlistSource.type === 'cloudDisk') {
    return '/library';
  } else {
    return `/${state.player.playlistSource.type}/${state.player.playlistSource.id}`;
  }
}
