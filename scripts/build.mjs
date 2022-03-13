import { build } from 'vite'

await build({
  configFile: 'packages/main/vite.config.ts',
  mode: process.env.NODE_ENV === 'debug' ? 'debug' : 'production'
})
await build({ configFile: 'packages/preload/vite.config.ts' })
await build({ configFile: 'packages/renderer/vite.config.ts' })
