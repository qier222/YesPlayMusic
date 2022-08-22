/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

const pkg = require('./package.json')
const electronVersion = pkg.devDependencies.electron.replaceAll('^', '')

module.exports = {
  appId: 'com.qier222.yesplaymusic.alpha',
  productName: pkg.productName,
  copyright: 'Copyright © 2022 qier222',
  asar: true,
  directories: {
    output: 'release',
    buildResources: 'build',
  },
  npmRebuild: false,
  buildDependenciesFromSource: true,
  electronVersion,
  publish: [
    {
      provider: 'github',
      owner: 'qier222',
      repo: 'YesPlayMusic',
      vPrefixedTagName: true,
      releaseType: 'draft',
    },
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      // {
      //   target: 'nsis',
      //   arch: ['arm64'],
      // },
      // {
      //   target: 'portable',
      //   arch: ['x64'],
      // },
    ],
    publisherName: 'qier222',
    icon: 'build/icons/icon.ico',
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    artifactName: '${productName}-${version}-${os}-${arch}-Setup.${ext}',
  },
  portable: {
    artifactName: '${productName}-${version}-${os}-${arch}-Portable.${ext}',
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: [
          'x64',
          'arm64',
          // 'universal'
        ],
      },
    ],
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
    darkModeSupport: true,
    category: 'public.app-category.music',
  },
  dmg: {
    icon: 'build/icons/icon.icns',
  },
  linux: {
    target: [
      {
        target: 'deb',
        arch: [
          'x64',
          // 'arm64',
          // 'armv7l'
        ],
      },
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      // {
      //   target: 'snap',
      //   arch: ['x64'],
      // },
      // {
      //   target: 'pacman',
      //   arch: ['x64'],
      // },
      // {
      //   target: 'rpm',
      //   arch: ['x64'],
      // },
      // {
      //   target: 'tar.gz',
      //   arch: ['x64'],
      // },
    ],
    artifactName: '${productName}-${version}-${os}.${ext}',
    category: 'Music',
    icon: './build/icon.icns',
  },
  files: [
    '!**/*.ts',
    '!**/node_modules/better-sqlite3/{bin,build,deps}/**',
    '!**/node_modules/*/{*.MD,*.md,README,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json,pnpm-lock.yaml}',
    '!**/*.{map,debug.min.js}',

    '!**/dist/binary',
    {
      from: './dist',
      to: './main',
    },
    {
      from: '../web/dist',
      to: './web',
    },
    {
      from: './migrations',
      to: 'main/migrations',
    },
    {
      from: './assets',
      to: 'main/assets',
    },
    './main',
  ],
}
