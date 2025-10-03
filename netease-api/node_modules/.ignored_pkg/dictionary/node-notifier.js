'use strict';

module.exports = {
  pkg: {
    patches: {
      'notifiers/balloon.js': [
        "__dirname, '../vendor/notifu/notifu'",
        "path.dirname(process.execPath), 'notifier/notifu'",
      ],
      'notifiers/notificationcenter.js': [
        "__dirname,\n  '../vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier'",
        "path.dirname(process.execPath), 'notifier/terminal-notifier'",
      ],
      'notifiers/toaster.js': [
        "__dirname, '../vendor/snoreToast/snoretoast'",
        "path.dirname(process.execPath), 'notifier/snoretoast'",
      ],
    },
    deployFiles: [
      ['vendor/notifu/notifu.exe', 'notifier/notifu.exe'],
      ['vendor/notifu/notifu64.exe', 'notifier/notifu64.exe'],
      [
        'vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier',
        'notifier/terminal-notifier',
      ],
      ['vendor/snoreToast/snoretoast-x64.exe', 'notifier/snoretoast-x64.exe'],
      ['vendor/snoreToast/snoretoast-x86.exe', 'notifier/snoretoast-x86.exe'],
    ],
  },
};
