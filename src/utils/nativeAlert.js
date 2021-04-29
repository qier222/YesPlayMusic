/**
 * Returns an alert-like function that fits current runtime environment
 *
 * This function is amid to solve a electron bug on Windows, that, when
 * user dismissed a browser alert, <input> elements cannot be focused
 * for further editing unless switching to another window and then back
 *
 * @returns { (message:string) => void }
 * Built-in alert function for browser environment
 * A function wrapping {@link dialog.showMessageBoxSync} for electron environment
 *
 * @see {@link https://github.com/electron/electron/issues/19977} for upstream electron issue
 */
const nativeAlert = (() => {
  if (process.env.IS_ELECTRON === true) {
    const {
      remote: { dialog },
    } = require('electron');
    if (dialog) {
      return message => {
        var options = {
          type: 'warning',
          detail: message,
        };
        dialog.showMessageBoxSync(null, options);
      };
    }
  }
  return alert;
})();

export default nativeAlert;
