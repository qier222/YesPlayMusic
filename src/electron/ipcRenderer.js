export function ipcRenderer(vueInstance) {
  const self = vueInstance;
  // 添加专有的类名
  document.body.setAttribute("data-electron", "yes");
  document.body.setAttribute(
    "data-electron-os",
    window.require("os").platform()
  );
  // ipc message channel
  const electron = window.require("electron");
  const ipcRenderer = electron.ipcRenderer;

  // listens to the main process 'changeRouteTo' event and changes the route from
  // inside this Vue instance, according to what path the main process requires.
  // responds to Menu click() events at the main process and changes the route accordingly.

  ipcRenderer.on("changeRouteTo", (event, path) => {
    self.$router.push(path);
  });

  ipcRenderer.on("search", () => {
    // 触发数据响应
    self.$refs.navbar.$refs.searchInput.focus();
    self.$refs.navbar.inputFocus = true;
  });

  ipcRenderer.on("play", () => {
    self.$refs.player.play();
  });

  ipcRenderer.on("next", () => {
    console.log("touchBar:next");
    self.$refs.player.next();
  });

  ipcRenderer.on("previous", () => {
    self.$refs.player.previous();
  });

  ipcRenderer.on("increaseVolume", () => {
    if (self.$refs.player.volume + 0.1 >= 1) {
      return (self.$refs.player.volume = 1);
    }
    self.$refs.player.volume += 0.1;
  });

  ipcRenderer.on("decreaseVolume", () => {
    if (self.$refs.player.volume - 0.1 <= 0) {
      return (self.$refs.player.volume = 0);
    }
    self.$refs.player.volume -= 0.1;
  });

  ipcRenderer.on("like", () => {
    self.$refs.player.likeCurrentSong();
  });

  ipcRenderer.on("repeat", () => {
    self.$refs.player.repeat();
  });

  ipcRenderer.on("shuffle", () => {
    self.$refs.player.shuffle();
  });

  ipcRenderer.on("routerGo", (event, where) => {
    console.log(where);
    self.$refs.navbar.go(where);
  });

  ipcRenderer.on("nextUp", () => {
    self.$refs.player.goToNextTracksPage();
  });
}
