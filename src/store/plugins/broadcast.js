// const electron = import('electron')
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

export default (store) => {
  // 第一行初始化第一次的状态
  ipcRenderer.send("vuex-state", store.state);
  store.subscribe(
    (
      mutation,
      { data = "", settings = "", player = {}, contextMenu = {}, liked = {} }
    ) => {
      const copyState = { data, settings, player, contextMenu, liked };
      ipcRenderer.send("vuex-state", copyState);
    }
  );
  store.subscribe((mutation, state) => {
    if (mutation.type === "updateData") {
      ipcRenderer.send("updateData", state.data);
    }
  });
};
