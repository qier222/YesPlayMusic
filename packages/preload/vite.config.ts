import dotenv from 'dotenv'
import { builtinModules } from 'module'
import path from 'path'
import { defineConfig } from 'vite'
import pkg from '../../package.json'
import { visualizer } from 'rollup-plugin-visualizer'

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/preload',
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    minify: process.env./* from mode option */ NODE_ENV === 'production',
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
      plugins: [
        visualizer({
          filename: './bundle-stats-preload.html',
          gzipSize: true,
          projectRoot: 'packages/preload',
        }),
      ],
    },
  },
})
