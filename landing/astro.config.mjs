import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://yesplaymusic.0xtangerine.com',
  integrations: [react()],
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    // Both locales live under a prefix; worker/index.js redirects / by cookie, then Accept-Language
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
