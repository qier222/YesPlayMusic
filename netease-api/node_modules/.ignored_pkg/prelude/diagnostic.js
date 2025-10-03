/* eslint-disable global-require */
/* eslint-disable no-console */
/* global DICT */

'use strict';

(function installDiagnostic() {
  const fs = require('fs');
  const path = require('path');
  const win32 = process.platform === 'win32';

  if (process.env.DEBUG_PKG === '2') {
    console.log(Object.entries(DICT));
  }
  function dumpLevel(filename, level, tree) {
    let totalSize = 0;
    const d = fs.readdirSync(filename);
    for (let j = 0; j < d.length; j += 1) {
      const f = path.join(filename, d[j]);
      const realPath = fs.realpathSync(f);
      const isSymbolicLink2 = f !== realPath;

      const s = fs.statSync(f);
      totalSize += s.size;

      if (s.isDirectory() && !isSymbolicLink2) {
        const tree1 = [];
        totalSize += dumpLevel(f, level + 1, tree1);
        const str =
          (' '.padStart(level * 2, ' ') + d[j]).padEnd(40, ' ') +
          (totalSize.toString().padStart(10, ' ') +
            (isSymbolicLink2 ? `=> ${realPath}` : ' '));
        tree.push(str);
        tree1.forEach((x) => tree.push(x));
      } else {
        const str =
          (' '.padStart(level * 2, ' ') + d[j]).padEnd(40, ' ') +
          (s.size.toString().padStart(10, ' ') +
            (isSymbolicLink2 ? `=> ${realPath}` : ' '));
        tree.push(str);
      }
    }
    return totalSize;
  }
  function wrap(obj, name) {
    const f = fs[name];
    obj[name] = (...args) => {
      const args1 = Object.values(args);
      console.log(
        `fs.${name}`,
        args1.filter((x) => typeof x === 'string')
      );
      return f.apply(this, args1);
    };
  }
  if (process.env.DEBUG_PKG) {
    console.log('------------------------------- virtual file system');
    const startFolder = win32 ? 'C:\\snapshot' : '/snapshot';
    console.log(startFolder);

    const tree = [];
    const totalSize = dumpLevel(startFolder, 1, tree);
    console.log(tree.join('\n'));

    console.log('Total size = ', totalSize);
    if (process.env.DEBUG_PKG === '2') {
      wrap(fs, 'openSync');
      wrap(fs, 'open');
      wrap(fs, 'readSync');
      wrap(fs, 'read');
      wrap(fs, 'writeSync');
      wrap(fs, 'write');
      wrap(fs, 'closeSync');
      wrap(fs, 'readFileSync');
      wrap(fs, 'close');
      wrap(fs, 'readFile');
      wrap(fs, 'readdirSync');
      wrap(fs, 'readdir');
      wrap(fs, 'realpathSync');
      wrap(fs, 'realpath');
      wrap(fs, 'statSync');
      wrap(fs, 'stat');
      wrap(fs, 'lstatSync');
      wrap(fs, 'lstat');
      wrap(fs, 'fstatSync');
      wrap(fs, 'fstat');
      wrap(fs, 'existsSync');
      wrap(fs, 'exists');
      wrap(fs, 'accessSync');
      wrap(fs, 'access');
    }
  }
})();
