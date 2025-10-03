class UploadTimer {
  /**
   * @constructor
   * @param {number} timeout - timer timeout in msecs.
   * @param {Function} callback - callback to run when timeout reached.
   */
  constructor(timeout, callback) {
    this.timeout = timeout || 0;
    this.callback = callback || (() => {});
    this.timer = null;
  }

  /**
   * Sets the timer.
   * Initializes & starts the timer.
   * @returns {boolean} True if timer has been set.
   */
  set() {
    if (this.timer || !this.timeout) return false;
    this.timer = setTimeout(() => {
      this.clear();
      this.callback();
    }, this.timeout);
    return true;
  }

  /**
   * Clears the timer.
   * If timer cleared, it has to be re-initialized again with set method.
   */
  clear() {
    clearTimeout(this.timer);
  }

  /**
   * Refreshes timer.
   * @returns {boolean} True if timer has been refreshed.
   */
  refresh() {
    // Do nothing if zero/empty timeout or timer hasn't been initialized.
    if (!this.timer) return false;
    this.timer.refresh();
    return true;
  }
}

module.exports = UploadTimer;
