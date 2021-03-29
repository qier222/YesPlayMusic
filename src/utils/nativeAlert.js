/**
 * 返回适合平台的 alert 函数
 * @returns { (message:string) => void }
 */
const nativeAlert = (() => {
  // Windows 环境下的 Electron 存在 bug, 页面内通过 alert 函数弹出提示框
  // 确认后页面内输入框无法获得焦点, 需要切换焦点窗口才能恢复
  if (process.env.IS_ELECTRON === true) {
    const {
      remote: { dialog },
    } = require("electron");
    if (dialog) {
      return (message) => {
        var options = {
          type: "warning",
          title: "提示",
          detail: message,
        };
        dialog.showMessageBoxSync(null, options);
      };
    }
  }
  return alert;
})();

export default nativeAlert;
