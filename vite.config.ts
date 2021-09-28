import vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

dotenv.config({ path: join(__dirname, '.env') })

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: './src/renderer/public',
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, 'src/renderer/assets/icons')],
      symbolId: 'icon-[name]',
    }),
    Components({
      dirs: ['src/renderer'],
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        {
          'vue-i18n': ['useI18n'],
          'vue-query': ['useQuery', 'useInfiniteQuery', 'QueryClient'],
          '@renderer/store': ['useStore'],
          // '@renderer/utils/common': ['resizeImage', 'formatDate'],
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@renderer': join(__dirname, 'src/renderer'),
      '@main': join(__dirname, 'src/main'),
      '@common': join(__dirname, 'src/common'),
    },
  },
  base: './',
  server: {
    port: +process.env.ELECTRON_WEB_SERVER_PORT,
    proxy: {
      '/netease-api/': {
        target: `http://127.0.0.1:${process.env.ELECTRON_NETEASE_API_PORT}`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/netease-api/, ''),
      },
    },
  },
  build: {
    outDir: join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './bundle-stats.html',
          gzipSize: true,
          projectRoot: 'src/renderer',
        }),
      ],
    },
  },
})
