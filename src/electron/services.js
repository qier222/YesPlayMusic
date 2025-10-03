import clc from 'cli-color';
import server from '@neteaseapireborn/api/server';

export async function startNeteaseMusicApi() {
  // Let user know that the service is starting
  console.log(
    `${clc.blueBright(
      '[NetEase API]'
    )} ========================================`
  );
  console.log(
    `${clc.blueBright('[NetEase API]')} 🚀 Starting @neteaseapireborn/api...`
  );
  console.log(`${clc.blueBright('[NetEase API]')} 📍 Port: 10754`);
  console.log(
    `${clc.blueBright('[NetEase API]')} 📦 API Version: ${
      require('../../netease-api/package.json').version
    }`
  );
  console.log(
    `${clc.blueBright(
      '[NetEase API]'
    )} ========================================`
  );

  try {
    // Load the NCM API with logging
    const moduleDefs = require('../ncmModDef');
    console.log(
      `${clc.greenBright('[NetEase API]')} ✅ Loaded ${
        moduleDefs.length
      } API modules`
    );

    await server.serveNcmApi({
      port: 10754,
      moduleDefs: moduleDefs,
    });

    console.log(
      `${clc.greenBright(
        '[NetEase API]'
      )} ✅ Server started successfully on http://127.0.0.1:10754`
    );
    console.log(
      `${clc.greenBright('[NetEase API]')} 📝 API Ready for requests`
    );
  } catch (error) {
    console.error(
      `${clc.redBright('[NetEase API]')} ❌ Failed to start API server:`
    );
    console.error(`${clc.redBright('[NetEase API]')} Error:`, error.message);
    console.error(`${clc.redBright('[NetEase API]')} Stack:`, error.stack);
    throw error;
  }
}
