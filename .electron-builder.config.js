/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'yesplaymusic',
  productName: 'YesPlayMusic',
  copyright: 'Copyright © 2022 ${author}',
  asar: true,
  directories: {
    output: 'release/${version}',
    buildResources: 'build',
  },
  files: ['dist'],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      {
        target: 'nsis',
        arch: ['arm64'],
      },
      {
        target: 'nsis',
        arch: ['ia32'],
      },
    ],
    artifactName: '${productName}-${version}-Setup.${ext}',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
  },
  mac: {
    target: ['dmg'],
    artifactName: '${productName}-${version}-Installer.${ext}',
  },
  linux: {
    target: ['AppImage'],
    artifactName: '${productName}-${version}-Installer.${ext}',
  },
}
