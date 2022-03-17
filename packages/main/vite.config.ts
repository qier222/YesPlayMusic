import dotenv from 'dotenv'
import { builtinModules } from 'module'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import pkg from '../../package.json'
import esm2cjs from '../../scripts/vite-plugin-esm2cjs'

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    minify: process.env./* from mode option */ NODE_ENV === 'production',
    sourcemap: process.env./* from mode option */ NODE_ENV === 'debug',
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
      plugins: [
        visualizer({
          filename: './bundle-stats-main.html',
          gzipSize: true,
          projectRoot: 'packages/main',
        }),
      ],
    },
  },
})
