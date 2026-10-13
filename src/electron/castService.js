// Starts and stops the `ncm-castd` daemon that carries the push protocols.
//
// Modelled on `src/electron/services.js` (which starts the bundled NetEase API
// server on 10754): the daemon is a plain child process on 127.0.0.1:9100, so a
// failure here must never stop the player from starting.

import { app } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const clc = require('cli-color');
const log = text => {
  console.log(`${clc.magentaBright('[ncm-cast]')} ${text}`);
};

export const CAST_PORT = 9100;

/**
 * `app.getAppPath()` / `app.getPath()` 在 app ready 之前调用会抛
 * "Cannot access app before app is ready"。本模块是在 background.js 顶层
 * （app ready 前）被加载的，所以必须包起来，绝不能让投屏服务拖垮播放器启动。
 */
function safeAppPath(name) {
  try {
    return app.getPath(name);
  } catch {
    return null;
  }
}

function safeAppRoot() {
  try {
    return app.getAppPath();
  } catch {
    return null;
  }
}

/** Everywhere the binary might reasonably be, in priority order. */
function candidatePaths() {
  const exe = process.platform === 'win32' ? 'ncm-castd.exe' : 'ncm-castd';
  const appRoot = safeAppRoot();
  const roots = [
    process.env.NCM_CASTD_PATH, // explicit override, dev or custom install
    process.resourcesPath && path.join(process.resourcesPath, exe), // packaged
    appRoot && path.join(appRoot, 'bin', exe), // dev: <project>/bin
    path.join(__dirname, '..', '..', 'bin', exe), // dev fallback
    path.join(process.cwd(), 'bin', exe),
  ];
  return roots.filter(Boolean);
}

function resolveBinary() {
  for (const p of candidatePaths()) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore unreadable paths */
    }
  }
  return null;
}

let daemon = null;

export function startCastService() {
  const bin = resolveBinary();
  if (!bin) {
    // Not an error worth blocking over: the UI shows "推送服务未启动" instead.
    log(
      `ncm-castd 未找到，已跳过推送服务。将 ncm-castd 放到 ${path.join(
        safeAppRoot() || process.cwd(),
        'bin'
      )} 或设置 NCM_CASTD_PATH。`
    );
    return null;
  }

  // userData 目录同样要等 app ready，取不到就退回临时目录，绝不能因此崩溃
  const cookieDir =
    safeAppPath('userData') || path.join(os.tmpdir(), 'yesplaymusic');
  const cookieFile = path.join(cookieDir, 'ncm-cast-cookie.txt');

  const args = ['--port', String(CAST_PORT), '--cookie-file', cookieFile];

  // Direct mode: hand the renderer the NetEase CDN URL instead of our local
  // gateway. Needed on LANs where the renderer can't reach the PC (AP
  // isolation, third-party firewalls such as 360 LAN protection) — there
  // gateway mode reports success but nothing plays. Default ON; set
  // NCM_CAST_DIRECT=0 to fall back to the local proxy.
  if (process.env.NCM_CAST_DIRECT !== '0') {
    args.push('--direct');
  }

  // The LAN address advertised to renderers. Only relevant in gateway mode
  // (the device fetches from us); set it when the PC has several NICs or
  // auto-detection picks the wrong one.
  if (process.env.NCM_CAST_HOST) {
    args.push('--host', process.env.NCM_CAST_HOST);
  }

  log(
    `starting ${bin} on 127.0.0.1:${CAST_PORT}${
      args.includes('--direct') ? ' (direct mode)' : ''
    }`
  );
  daemon = spawn(bin, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  daemon.stdout.on('data', d => log(String(d).trim()));
  daemon.stderr.on('data', d => log(String(d).trim()));
  daemon.on('error', err => log(`failed to start: ${err.message}`));
  daemon.on('exit', (code, signal) => {
    log(`exited (code=${code} signal=${signal})`);
    daemon = null;
  });

  // Never let a crashed daemon keep the app alive, and never leave it orphaned.
  // 不用可选链调用（主进程的 babel 目标不支持该语法）
  if (typeof daemon.unref === 'function') {
    daemon.unref();
  }
  return daemon;
}

export function stopCastService() {
  if (!daemon) return;
  log('stopping');
  try {
    daemon.kill();
  } catch {
    /* already gone */
  }
  daemon = null;
}

export function isCastServiceRunning() {
  return Boolean(daemon);
}
