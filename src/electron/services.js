import clc from 'cli-color';
import checkAuthToken from '../utils/checkAuthToken';
import server from 'NeteaseCloudMusicApi/server';

const { spawn } = require('child_process');
const path = require('path');

export async function startNeteaseMusicApi() {
  // Let user know that the service is starting
  console.log(`${clc.redBright('[NetEase API]')} initiating NCM API`);

  // Load the NCM API.
  await server.serveNcmApi({
    port: 10754,
    moduleDefs: require('../ncmModDef'),
  });
}

export async function startBilibiliAudioServer() {
  // Let user know that the service is starting
  console.log(`${clc.redBright('[Blueprint API]')} initiating Blueprint API`);

  const resourcePath =
    process.env.NODE_ENV === 'development' ? __dirname : process.resourcesPath;
  console.log('资源路径:', resourcePath);
  // const goExecutablePath = path.join(resourcePath, 'library/bilibili-server.exe'); cnm
  const goExecutablePath = path.resolve(
    resourcePath,
    'library',
    'bilibili-server.exe'
  );
  // fs.writeFile('D:/example.txt', goExecutablePath, 'utf8', (err) => {
  //   if (err) {
  //     console.error('写入文件失败:', err);
  //   } else {
  //     console.log('文件写入成功');
  //   }
  // });
  console.log('Go 可执行文件路径:', goExecutablePath);
  const env = Object.assign({}, process.env, {
    LISTEN_PORT: '10764', // 这里设置你需要的端口号
  });
  const goServer = spawn(goExecutablePath, [], { stdio: 'ignore', env: env });

  goServer.on('error', err => {
    console.error('Go server failed to start:', err);
  });

  goServer.on('close', code => {
    console.log(`Go server exited with code ${code}`);
  });

  goServer.on('exit', (code, signal) => {
    console.log(`Go API 进程退出，退出码: ${code}, 信号: ${signal}`);
  });

  return goServer;
}