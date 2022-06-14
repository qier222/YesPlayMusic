/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path, { join } from 'path'
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })
const IS_ELECTRON = process.env.IS_ELECTRON

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  clearScreen: IS_ELECTRON ? false : true,
  mode: process.env.NODE_ENV,
  root: './',
  base: '/',
  resolve: {
    alias: {
      '@': join(__dirname, '../'),
    },
  },
  plugins: [
    react(),

    /**
     * @see https://vite-plugin-pwa.netlify.app/guide/generate.html
     */
    VitePWA({
      manifest: {
        name: 'YesPlayMusic',
        short_name: 'YPM',
        description: 'Description of your app',
        theme_color: '#000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    /**
     * @see https://github.com/vbenjs/vite-plugin-svg-icons
     */
    createSvgIconsPlugin({
      iconDirs: [join(__dirname, './assets/icons')],
      symbolId: 'icon-[name]',
    }),
  ],
  build: {
    target: IS_ELECTRON ? 'esnext' : 'modules',
    sourcemap: true,
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './bundle-stats.html',
          gzipSize: true,
          projectRoot: './',
          template: 'treemap',
        }),
      ],
    },
  },
  server: {
    port: Number(process.env['ELECTRON_WEB_SERVER_PORT'] || 42710),
    strictPort: IS_ELECTRON ? true : false,
    proxy: {
      '/netease/': {
        target: `http://192.168.2.111:${
          process.env.ELECTRON_DEV_NETEASE_API_PORT || 3000
        }`,
        changeOrigin: true,
        rewrite: path => (IS_ELECTRON ? path : path.replace(/^\/netease/, '')),
      },
      '/yesplaymusic/video-cover': {
        target: `http://168.138.40.199:51324`,
        // target: `http://127.0.0.1:51324`,
        changeOrigin: true,
      },
      '/yesplaymusic/': {
        target: `http://127.0.0.1:${
          process.env.ELECTRON_DEV_NETEASE_API_PORT || 3000
        }`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number(process.env['ELECTRON_WEB_SERVER_PORT'] || 42710),
  },
  test: {
    environment: 'jsdom',
  },
})
