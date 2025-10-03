'use strict';

module.exports = {
  pkg: {
    patches: {
      'utils/ChromiumDownloader.js': [
        "path.join(__dirname, '..', '.local-chromium')",
        "path.join(path.dirname(process.execPath), 'puppeteer')",
      ],
    },
    deployFiles: [['.local-chromium', 'puppeteer', 'directory']],
  },
};
