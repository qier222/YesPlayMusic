/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist/electron',
  },
  npmRebuild: false,
  buildDependenciesFromSource: true,
  files: [
    'dist/main/**/*',
    'dist/renderer/**/*',
    'node_modules/NeteaseCloudMusicApi',
  ],
  asar: false,
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
}

module.exports = config
