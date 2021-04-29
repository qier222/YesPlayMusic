// node module
const fs = require('fs');
const https = require('https');
const resolve = require('path').resolve;
const join = require('path').resolve;
const extract = require('extract-zip');

// 函数参数
const dest = resolve(__dirname, '../');
const fileName = 'NeteaseCloudMusicApi-master.zip';
const options = {
  hostname: 'github.91chifun.workers.dev',
  path: `//https://github.com/Binaryify/NeteaseCloudMusicApi/archive/master.zip`,
};

// 完整的流程控制
/**
 * 1. 检查本地文件是否已有
 * 2. 下载默认/指定版本的 zip 压缩包，等待下载
 * 3. 解压缩
 * 4. 进入目录安装依赖 npm install
 */

function fix2(number) {
  return number.toFixed(2);
}

async function download(options, fileName, callback) {
  return await new Promise((resolve, reject) => {
    const destPath = join(__dirname, '../' + fileName);
    // Check if exist
    if (fs.existsSync(destPath)) return resolve(destPath);

    const file = fs.createWriteStream(destPath);
    const request = https.get(options, res => {
      let len = res.headers && parseInt(res.headers['content-length'], 10);
      let cur = 0;
      // 1048576 - bytes in 1Megabyte
      const MEGA = 1048576;
      let total = 0;
      if (len) {
        total = len / MEGA;
      }
      if (!len) {
        console.log(
          'Downloading, but can not get content-length, please be patient.'
        );
      }
      res.on('data', chunk => {
        if (len) {
          cur += chunk.length;
          console.log(
            `Downloading ${fix2((100.0 * cur) / len)}% ${fix2(
              cur / MEGA
            )}/${fix2(total)}mb`
          );
        }
      });
      res.on('end', () => {
        callback('Downloading complete!');
      });
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          callback('File wrote complete!');
          resolve(destPath);
        });
      });
      file.on('error', err => {
        fs.unlink(destPath);
        reject(err);
      });
      request.on('error', err => {
        console.log('Error: ' + err.message);
      });
    });
  });
}

async function unzip(source, target) {
  try {
    await extract(source, {
      dir: target,
    });
    console.log('Extraction complete');
    return true;
  } catch (err) {
    // handle any errors
    if (err.message === 'end of central directory record signature not found') {
      console.log('Not a full_downloaded zip file, removed!');
      fs.unlinkSync(source);
    }
    return false;
  }
}
// Download process
download(options, fileName, text => {
  console.log(text);
}).then(path => {
  console.log(path);
  // Unzip process
  return unzip(path, dest);
});
