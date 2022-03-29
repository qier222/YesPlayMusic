import { clientPlugin, defineConfig } from '@vitebook/client/node';
import { preactPlugin } from '@vitebook/preact/node';
import { defaultThemePlugin, DefaultThemeConfig } from '@vitebook/theme-default/node';
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig<DefaultThemeConfig>({
  include: ['packages/renderer/src/**/*.story.{jsx,tsx}'],
  plugins: [
    preactPlugin({ appFile: 'App.tsx' }),
    clientPlugin(),
    defaultThemePlugin(),
  ],
  site: {
    title: '',
    description: '',
    theme: {},
  },
  vite: {
    plugins: [
      AutoImport({
        dts: 'packages/renderer/src/auto-imports.d.ts',
        imports: [
          'react',
          { classnames: [['default', 'classNames']] },
          { 'react-query': ['useQuery', 'useMutation', 'useInfiniteQuery'] },
          // { 'react-router-dom': ['useNavigate', 'useParams'] },
          { 'react-hot-toast': ['toast'] },
          { valtio: ['useSnapshot'] },
        ],
      }), 
    ],
  }, 
});
