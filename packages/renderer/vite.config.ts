import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { builtinModules } from 'module'
import path, { join } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig, Plugin } from 'vite'
import resolve from 'vite-plugin-resolve'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { visualizer } from 'rollup-plugin-visualizer'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    react(),

    /**
     * Here you can specify other modules
     * 🚧 You have to make sure that your module is in `dependencies` and not in the` devDependencies`,
     *    which will ensure that the electron-builder can package it correctly
     * @example
     * {
     *   'electron-store': 'const Store = require("electron-store"); export default Store;',
     * }
     */
    resolveElectron(),

    /**
     * @see https://github.com/vbenjs/vite-plugin-svg-icons
     */
    createSvgIconsPlugin({
      iconDirs: [
        path.resolve(process.cwd(), 'packages/renderer/src/assets/icons'),
      ],
      symbolId: 'icon-[name]',
    }),

    /**
     * @see https://github.com/antfu/unplugin-auto-import
     */
    AutoImport({
      dts: './src/auto-imports.d.ts',
      imports: [
        'react',
        { classnames: [['default', 'classNames']] },
        { 'react-query': ['useQuery', 'useMutation', 'useInfiniteQuery'] },
        { 'react-router-dom': ['useNavigate', 'useParams'] },
        { 'react-hot-toast': ['toast'] },
        { valtio: ['useSnapshot'] },
      ],
    }),
  ],
  base: './',
  build: {
    sourcemap: process.env.NODE_ENV === 'debug',
    outDir: '../../dist/renderer',
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './bundle-stats-renderer.html',
          gzipSize: true,
          projectRoot: 'packages/renderer',
          template: 'treemap',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
  clearScreen: false,
  server: {
    port: Number(process.env['ELECTRON_WEB_SERVER_PORT'] ?? 42710),
    proxy: {
      '/netease/': {
        target: `http://127.0.0.1:${process.env.ELECTRON_DEV_NETEASE_API_PORT}/netease`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/netease/, ''),
      },
    },
  },
})

/**
 * For usage of Electron and NodeJS APIs in the Renderer process
 * @see https://github.com/caoxiemeihao/electron-vue-vite/issues/52
 */
export function resolveElectron(
  resolves: Parameters<typeof resolve>[0] = {}
): Plugin {
  const builtins = builtinModules.filter(t => !t.startsWith('_'))

  /**
   * @see https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme
   */
  return resolve({
    electron: electronExport(),
    ...builtinModulesExport(builtins),
    ...resolves,
  })

  function electronExport() {
    return `
/**
 * For all exported modules see https://www.electronjs.org/docs/latest/api/clipboard -> Renderer Process Modules
 */
const electron = require("electron");
const {
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
  deprecate,
} = electron;

export {
  electron as default,
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
  deprecate,
}
`
  }

  function builtinModulesExport(modules: string[]) {
    return modules
      .map(moduleId => {
        const nodeModule = require(moduleId)
        const requireModule = `const M = require("${moduleId}");`
        const exportDefault = `export default M;`
        const exportMembers =
          Object.keys(nodeModule)
            .map(attr => `export const ${attr} = M.${attr}`)
            .join(';\n') + ';'
        const nodeModuleCode = `
${requireModule}

${exportDefault}

${exportMembers}
`

        return { [moduleId]: nodeModuleCode }
      })
      .reduce((memo, item) => Object.assign(memo, item), {})
  }
}
