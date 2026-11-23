// Only two pages, so hand-written. Each lists hreflang alternates, matching the <head> links.
import type { APIRoute } from 'astro';
import { languages, pathOf, type Lang } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const langs = Object.keys(languages) as Lang[];
  const href = (p: string) => new URL(p, site).href;
  const hreflang = (l: Lang) => (l === 'zh' ? 'zh-CN' : l);
  const alternates = [
    ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${hreflang(l)}" href="${href(pathOf(l))}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href('/')}"/>`,
  ].join('\n');
  const urls = langs.map((l) => `  <url>\n    <loc>${href(pathOf(l))}</loc>\n${alternates}\n  </url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
