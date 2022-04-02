import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path, { join } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { visualizer } from 'rollup-plugin-visualizer'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: './src/renderer',
  plugins: [
    react(),

    /**
     * @see https://github.com/vbenjs/vite-plugin-svg-icons
     */
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/renderer/assets/icons')],
      symbolId: 'icon-[name]',
    }),

    /**
     * @see https://github.com/antfu/unplugin-auto-import
     */
    AutoImport({
      dts: 'auto-imports.d.ts',
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
  base: '/',
  build: {
    target: process.env.IS_ELECTRON ? 'esnext' : 'modules',
    sourcemap: process.env.NODE_ENV === 'debug',
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './bundle-stats-renderer.html',
          gzipSize: true,
          projectRoot: 'src/renderer',
          template: 'treemap',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': join(__dirname, './src/renderer'),
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
      '/yesplaymusic/': {
        target: `http://127.0.0.1:${process.env.ELECTRON_DEV_NETEASE_API_PORT}/yesplaymusic`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/yesplaymusic/, ''),
      },
    },
  },
})
