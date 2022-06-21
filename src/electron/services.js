import clc from 'cli-color';
import server from 'NeteaseCloudMusicApi/server';

export async function startNeteaseMusicApi() {
  // Let user know that the service is starting
  console.log(`${clc.redBright('[NetEase API]')} initiating NCM API`);

  // Load the NCM API.
  await server.serveNcmApi({
    port: 35216,
    moduleDefs: require('../ncmModDef'),
  });
}
