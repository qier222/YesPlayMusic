import { builtinModules } from 'module'
import { Plugin, build } from 'vite'
import resolve from 'vite-plugin-resolve'

export default function esm2cjs(modules: string[]): Plugin {
  return resolve(
    {
      ...modules.reduce(
        (memo, moduleId) =>
          Object.assign(memo, {
            async [moduleId](args) {
              await build({
                plugins: [
                  {
                    name: 'vite-plugin[node:mod-to-mod]',
                    enforce: 'pre',
                    resolveId(source) {
                      if (source.startsWith('node:')) {
                        return source.replace('node:', '')
                      }
                    },
                  },
                ],
                build: {
                  outDir: args.dir,
                  minify: false,
                  emptyOutDir: false,
                  lib: {
                    entry: require.resolve(moduleId),
                    formats: ['cjs'],
                    fileName: () => `${moduleId}.js`,
                  },
                  rollupOptions: {
                    external: [...builtinModules],
                  },
                },
              })
            },
          } as Parameters<typeof resolve>[0]),
        {}
      ),
    },
    { dir: '.vite-plugin-resolve-esm' }
  )
}
