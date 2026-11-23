// Test plugins and a local HTTP server. The plugins are only test fixtures and aren't shipped with the app.

import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

const fixtureJs = r'''
import { helper } from "./lib/util.js";

export async function search({ query }) {
  const u = new URL("/search", host.setting("server"));
  u.searchParams.set("q", query);
  const r = await fetch(u, { headers: { "X-Test": "1" } });
  if (!r.ok) throw Object.assign(new Error("bad " + r.status), { code: "unavailable" });
  const j = await r.json();
  return { tracks: j.items.map(helper) };
}
export async function blocked() { await fetch("https://example.com/"); }
export async function redirectOut() { await fetch(host.setting("server") + "/out"); }
export async function redirectCreds({ to }) {
  const r = await fetch(host.setting("server") + "/to?u=" + encodeURIComponent(to), {
    headers: { Authorization: "Bearer t", Cookie: "s=1", "X-Keep": "1" },
  });
  return await r.json();
}
export function spin() { for (;;) {} }
export function comments({ id, sort, offset }) {
  return {
    total: 3, more: offset === 0,
    comments: [{ id: `${sort}-${offset}`, text: "好听", time: 1700000000000, likes: 2,
      user: { id: "u1", name: "晚风", imageUrl: "" },
      replyTo: { id: "c0", user: { name: "Sea" }, text: "隔着一层水" } }],
  };
}
export function postComment({ id, text, replyTo }) {
  return { id: "new", text: `${id}:${text}:${replyTo}`, user: { name: "我" } };
}
export function likeComment({ commentId, on }) {
  if (commentId === "bad") throw new Error("不能点赞");
  return on;
}
export function wait({ ms }) { return new Promise((r) => setTimeout(() => r(ms), ms)); }
export function store({ v }) { const old = host.storage.get("k") ?? null; host.storage.set("k", v); return old; }
export function lang() { return [host.language(), host.t("你好")]; }
export function needSignIn() { const e = new Error("请先登录"); e.code = "signIn"; throw e; }
export async function post() {
  const r = await fetch(host.setting("server") + "/echo", {
    method: "POST",
    body: new URLSearchParams({ a: "1 2", b: "中" }),
  });
  return { text: await r.text(), ct: r.headers.get("x-ct") };
}
export async function bytes() {
  const r = await fetch(host.setting("server") + "/bin");
  return [...new Uint8Array(await r.arrayBuffer())];
}
export async function abort() {
  const c = new AbortController();
  const f = fetch(host.setting("server") + "/slow", { signal: c.signal });
  setTimeout(() => c.abort(), 20);
  try { await f; return "not aborted"; } catch (e) { return e.name; }
}
export function misc() {
  return {
    md5: host.crypto.md5("abc"),
    aes: host.crypto.aesEcbEncrypt("0123456789abcdef", "hello"),
    url: new URL("../b?x=1#h", "https://a.com/p/q/r").href,
    enc: new TextDecoder().decode(new TextEncoder().encode("晚風🎵")),
    qs: new URLSearchParams("a=1&b=x+y&a=2").getAll("a").join(","),
    t: host.t("Hello"),
    platform: typeof host.platform,
  };
}
export function lyrics() {
  const e = new Error("请先登录");
  e.code = "signIn";
  throw e;
}
export function stream({ id, quality }) {
  return { url: id === "bad" ? "file:///etc/hosts" : id === "own" ? `file://${host.dir}/index.js` : host.setting("server") + "/bin?q=" + quality };
}
export function escape() { return import("../../outside.js"); }
''';

/// Writes a plugin under [root] and returns the plugin directory.
String writeFixture(
  String root, {
  String id = 'fixture',
  List<String>? network,
}) {
  final dir = p.join(root, id);
  void w(String rel, String text) => (File(
    p.join(dir, rel),
  )..parent.createSync(recursive: true)).writeAsStringSync(text);
  w(
    'plugin.json',
    jsonEncode({
      'id': id,
      'name': 'Fixture',
      'version': '1.0.0',
      'main': 'index.js',
      'permissions': {
        'network': network ?? ['{setting:server}'],
      },
      'settings': [
        {'key': 'server', 'label': 'Server'},
      ],
    }),
  );
  w('index.js', fixtureJs);
  w(
    'lib/util.js',
    'export const helper = (x) => ({ id: x.id, name: x.name, artists: [] });',
  );
  w('locales/zh-CN.json', '{"Hello": "你好"}');
  File(p.join(root, 'outside.js')).writeAsStringSync('export const x = 1;');
  return dir;
}

/// Local test server.
Future<HttpServer> fixtureServer() async {
  final s = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
  s.listen((req) async {
    final res = req.response;
    switch (req.uri.path) {
      case '/search':
        res.headers.contentType = ContentType.json;
        res.write(
          jsonEncode({
            'items': [
              {
                'id': '1',
                'name':
                    '${req.uri.queryParameters['q']}|${req.headers.value('x-test')}',
              },
            ],
          }),
        );
      case '/out':
        res.redirect(Uri.parse('http://localhost:${s.port}/search?q=x'));
        return;
      case '/to':
        res.redirect(Uri.parse(req.uri.queryParameters['u']!));
        return;
      case '/headers':
        res.headers.contentType = ContentType.json;
        res.write(
          jsonEncode({
            for (final k in ['authorization', 'cookie', 'x-keep'])
              k: req.headers.value(k),
          }),
        );
      case '/echo':
        res.headers.set('x-ct', req.headers.contentType.toString());
        res.write(await utf8.decodeStream(req));
      case '/bin':
        res.add([0, 255, 128]);
      case '/slow':
        await Future<void>.delayed(const Duration(seconds: 2));
      default:
        res.statusCode = 404;
    }
    await res.close();
  });
  return s;
}
