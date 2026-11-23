// Only handles / (see run_worker_first in wrangler.jsonc); everything else is served as static assets.
// Redirect rule: the language picked in the menu (cookie `lang`) wins; otherwise the first
// supported language in Accept-Language; otherwise English.
const LANGS = ['zh', 'en'];
const FALLBACK = 'en';

function fromCookie(header) {
  const m = header?.match(/(?:^|;\s*)lang=([a-z]+)/);
  return m && LANGS.includes(m[1]) ? m[1] : null;
}

function fromAcceptLanguage(header) {
  if (!header) return null;
  const prefs = header
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag, q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((p) => p.tag && p.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const { tag } of prefs) {
    const base = tag.split('-')[0];
    if (LANGS.includes(base)) return base;
  }
  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/') return env.ASSETS.fetch(request);

    const lang =
      fromCookie(request.headers.get('Cookie')) ?? fromAcceptLanguage(request.headers.get('Accept-Language')) ?? FALLBACK;
    url.pathname = `/${lang}/`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        Vary: 'Accept-Language, Cookie',
        'Cache-Control': 'private, no-store',
      },
    });
  },
};
