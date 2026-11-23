import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://yesplaymusic.0xtangerine.com',
  integrations: [react()],
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
