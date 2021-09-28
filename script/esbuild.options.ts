import { join } from 'path'
import { esbuildDecorators } from '@anatine/esbuild-decorators'
import { builtinModules } from 'module'
import { BuildOptions } from 'esbuild'
import dotenv from 'dotenv'
dotenv.config({ path: join(__dirname, '../.env') })

const define = {}
for (const k in process.env) {
  if (['ProgramFiles(x86)', 'CommonProgramFiles(x86)'].includes(k)) continue
  define[`process.env.${k}`] = JSON.stringify(process.env[k])
}

export function createOptions(): BuildOptions {
  return {
    entryPoints: [join(__dirname, '../src/main/index.ts')],
    target: 'es2020',
    outfile: join(__dirname, '../dist/main/index.js'),
    format: 'cjs',
    bundle: true,
    platform: 'node',
    define,
    tsconfig: join(__dirname, '../tsconfig.main.json'),
    plugins: [
      esbuildDecorators({
        tsconfig: join(__dirname, '../tsconfig.main.json'),
      }),
    ],
    external: [
      ...builtinModules.filter(
        x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)
      ),
      'electron',
    ],
  }
}
