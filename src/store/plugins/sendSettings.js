export function getSendSettingsPlugin() {
  const electron = window.require('electron');
  const ipcRenderer = electron.ipcRenderer;
  return store => {
    store.subscribe((mutation, state) => {
      // console.log(mutation);
      if (!['updateSettings', 'changeLang'].includes(mutation.type)) return;
      ipcRenderer.send('settings', state.settings);
    });
  };
}
