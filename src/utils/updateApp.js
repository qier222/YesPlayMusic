import initLocalStorage from '@/store/initLocalStorage.js';
import pkg from '../../package.json';

const updateSetting = () => {
  const parsedSettings = JSON.parse(localStorage.getItem('settings'));
  const settings = {
    ...initLocalStorage.settings,
    ...parsedSettings,
  };

  localStorage.setItem('settings', JSON.stringify(settings));
};

const updateData = () => {
  const parsedData = JSON.parse(localStorage.getItem('data'));
  const data = {
    ...parsedData,
  };
  localStorage.setItem('data', JSON.stringify(data));
};

const updatePlayer = () => {
  let parsedData = JSON.parse(localStorage.getItem('player'));
  let appVersion = localStorage.getItem('appVersion');
  if (appVersion === `"0.2.5"`) parsedData = {}; // 0.2.6版本重构了player
  const data = {
    _repeatMode: 'off',
    _shuffle: false,
    _list: [],
    _current: 0,
    _playlistSource: {},
    _volume: 1,
    _volumeBeforeMuted: 1,
    _currentTrack: {},
    _playNextList: [],
    _enabled: false,
    _shuffledList: [],
    _shuffledCurrent: 0,
    ...parsedData,
  };
  localStorage.setItem('player', JSON.stringify(data));
};

const removeOldStuff = () => {
  // remove old indexedDB databases created by localforage
  indexedDB.deleteDatabase('tracks');
};

export default function () {
  updateSetting();
  updateData();
  updatePlayer();
  removeOldStuff();
  localStorage.setItem('appVersion', JSON.stringify(pkg.version));
}
