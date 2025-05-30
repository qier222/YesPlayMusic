import defaultShortcuts from '@/utils/shortcuts';
const { globalShortcut } = require('electron');

const clc = require('cli-color');
const log = text => {
  console.log(`${clc.blueBright('[globalShortcut.js]')} ${text}`);
};

export function registerGlobalShortcut(win, store) {
  log('registerGlobalShortcut');
  let shortcuts = store.get('settings.shortcuts');
  if (shortcuts === undefined) {
    shortcuts = defaultShortcuts;
  }

  globalShortcut.register(
    shortcuts.find(s => s.id === 'play').globalShortcut,
    () => {
      win.webContents.send('play');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'next').globalShortcut,
    () => {
      win.webContents.send('next');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'previous').globalShortcut,
    () => {
      win.webContents.send('previous');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'increaseVolume').globalShortcut,
    () => {
      win.webContents.send('increaseVolume');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'decreaseVolume').globalShortcut,
    () => {
      win.webContents.send('decreaseVolume');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'like').globalShortcut,
    () => {
      win.webContents.send('like');
    }
  );
  globalShortcut.register(
    shortcuts.find(s => s.id === 'minimize').globalShortcut,
    () => {
      win.isVisible() ? win.hide() : win.show();
    }
  );

  /* 
  增加 多媒体键盘 特殊按键  ：
  多媒体键码值（keyCode） 
  音量大，音量小，静音，上一首，暂停/播放，下一首，停止   
  175，   174，   173，177，    179，    176，  178 
  */

  globalShortcut.register(
    179,
    () => {
      win.webContents.send('play');
    }
  );
  globalShortcut.register(
    176,
    () => {
      win.webContents.send('next');
    }
  );
  globalShortcut.register(
    177,
    () => {
      win.webContents.send('previous');
    }
  );

  //音量增大和减少采用 多媒体键盘全局设置即可。无需单独注册。
  /*
   注意： 
   在 macOS 10.14 Mojave 下面，如果 app 没有被授权为可信任使用的客户端，那么下列快捷键会注册失败：
    "Media Play/Pause"
    "Media Next Track"
    "Media Previous Track"
    "Media Stop"
   */
}
