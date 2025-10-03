const fs = require('fs');
const net = require('net');
const path = require('path');
const parse = require('url').parse;

const { logScope } = require('./logger');
const logger = logScope('server');
const sni = require('./sni');
const hook = require('./hook');
const request = require('./request');
const { isHost } = require('./utilities');

const proxy = {
	core: {
		mitm: (req, res) => {
			if (req.url === '/proxy.pac') {
				const url = parse('http://' + req.headers.host);
				res.writeHead(200, {
					'Content-Type': 'application/x-ns-proxy-autoconfig',
				});
				res.end(`
					function FindProxyForURL(url, host) {
						if (${Array.from(hook.target.host)
							.map((host) => `host == '${host}'`)
							.join(' || ')}) {
							return 'PROXY ${url.hostname}:${url.port || 80}'
						}
						return 'DIRECT'
					}
				`);
			} else {
				const ctx = { res, req };
				Promise.resolve()
					.then(() => proxy.protect(ctx))
					.then(() => proxy.authenticate(ctx))
					.then(() => hook.request.before(ctx))
					.then(() => proxy.filter(ctx))
					.then(() => proxy.log(ctx))
					.then(() => proxy.mitm.request(ctx))
					.then(() => hook.request.after(ctx))
					.then(() => proxy.mitm.response(ctx))
					.catch(() => proxy.mitm.close(ctx));
			}
		},
		tunnel: (req, socket, head) => {
			const ctx = { req, socket, head };
			Promise.resolve()
				.then(() => proxy.protect(ctx))
				.then(() => proxy.authenticate(ctx))
				.then(() => hook.connect.before(ctx))
				.then(() => proxy.filter(ctx))
				.then(() => proxy.log(ctx))
				.then(() => proxy.tunnel.connect(ctx))
				.then(() => proxy.tunnel.dock(ctx))
				.then(() => hook.negotiate.before(ctx))
				.then(() => proxy.tunnel.pipe(ctx))
				.catch(() => proxy.tunnel.close(ctx));
		},
	},
	abort: (socket) => {
		if (socket) socket.end();
		if (socket && !socket.destroyed) socket.destroy();
	},
	protect: (ctx) => {
		const { req, res, socket } = ctx;
		if (req) req.on('error', () => proxy.abort(req.socket, 'req'));
		if (res) res.on('error', () => proxy.abort(res.socket, 'res'));
		if (socket) socket.on('error', () => proxy.abort(socket, 'socket'));
	},
	log: (ctx) => {
		const { req, socket, decision } = ctx;
		if (socket)
			if (socket) logger.debug({ decision, url: req.url }, `TUNNEL`);
			else
				logger.debug(
					{
						decision,
						host: parse(req.url).host,
						encrypted: req.socket.encrypted,
					},
					`MITM${req.socket.encrypted ? ' (ssl)' : ''}`
				);
	},
	authenticate: (ctx) => {
		const { req, res, socket } = ctx;
		const credential = Buffer.from(
			(req.headers['proxy-authorization'] || '').split(/\s+/).pop() || '',
			'base64'
		).toString();
		if ('proxy-authorization' in req.headers)
			delete req.headers['proxy-authorization'];
		if (
			server.authentication &&
			credential !== server.authentication &&
			(socket || req.url.startsWith('http://'))
		) {
			if (socket)
				socket.write(
					'HTTP/1.1 407 Proxy Auth Required\r\nProxy-Authenticate: Basic realm="realm"\r\n\r\n'
				);
			else
				res.writeHead(407, {
					'proxy-authenticate': 'Basic realm="realm"',
				});
			return Promise.reject((ctx.error = 'authenticate'));
		}
	},
	filter: (ctx) => {
		if (ctx.decision || ctx.req.local) return;
		const url = parse((ctx.socket ? 'https://' : '') + ctx.req.url);
		const match = (pattern) =>
			url.href.search(new RegExp(pattern, 'g')) !== -1;
		try {
			const allow = server.whitelist.some(match);
			const deny = server.blacklist.some(match);
			// console.log('allow', allow, 'deny', deny)
			if (!allow && deny) {
				return Promise.reject((ctx.error = 'filter'));
			}
		} catch (error) {
			ctx.error = error;
		}
	},
	mitm: {
		request: (ctx) =>
			new Promise((resolve, reject) => {
				if (ctx.decision === 'close')
					return reject((ctx.error = ctx.decision));
				const { req } = ctx;
				if (isHost(req.url, 'bilivideo.com')) {
					req.headers['referer'] = 'https://www.bilibili.com/';
					req.headers['user-agent'] = 'okhttp/3.4.1';
				}
				const url = parse(req.url);
				const options = request.configure(req.method, url, req.headers);
				ctx.proxyReq = request
					.create(url)(options)
					.on('response', (proxyRes) =>
						resolve((ctx.proxyRes = proxyRes))
					)
					.on('error', (error) => reject((ctx.error = error)));
				req.readable
					? req.pipe(ctx.proxyReq)
					: ctx.proxyReq.end(req.body);
			}),
		response: (ctx) => {
			const { res, proxyRes } = ctx;
			proxyRes.on('error', () =>
				proxy.abort(proxyRes.socket, 'proxyRes')
			);
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.readable ? proxyRes.pipe(res) : res.end(proxyRes.body);
		},
		close: (ctx) => {
			proxy.abort(ctx.res.socket, 'mitm');
		},
	},
	tunnel: {
		connect: (ctx) =>
			new Promise((resolve, reject) => {
				if (ctx.decision === 'close')
					return reject((ctx.error = ctx.decision));
				const { req } = ctx;
				const url = parse('https://' + req.url);
				if (global.proxy && !req.local) {
					const options = request.configure(
						req.method,
						url,
						req.headers
					);
					request
						.create(proxy)(options)
						.on('connect', (_, proxySocket) =>
							resolve((ctx.proxySocket = proxySocket))
						)
						.on('error', (error) => reject((ctx.error = error)))
						.end();
				} else {
					const proxySocket = net
						.connect(
							url.port || 443,
							request.translate(url.hostname)
						)
						.on('connect', () =>
							resolve((ctx.proxySocket = proxySocket))
						)
						.on('error', (error) => reject((ctx.error = error)));
				}
			}),
		dock: (ctx) =>
			new Promise((resolve) => {
				const { req, head, socket } = ctx;
				socket
					.once('data', (data) =>
						resolve((ctx.head = Buffer.concat([head, data])))
					)
					.write(
						`HTTP/${req.httpVersion} 200 Connection established\r\n\r\n`
					);
			})
				.then((data) => (ctx.socket.sni = sni(data)))
				.catch((e) => e && logger.error(e)),
		pipe: (ctx) => {
			if (ctx.decision === 'blank')
				return Promise.reject((ctx.error = ctx.decision));
			const { head, socket, proxySocket } = ctx;
			proxySocket.on('error', () =>
				proxy.abort(ctx.proxySocket, 'proxySocket')
			);
			proxySocket.write(head);
			socket.pipe(proxySocket);
			proxySocket.pipe(socket);
		},
		close: (ctx) => {
			proxy.abort(ctx.socket, 'tunnel');
		},
	},
};

const cert = process.env.SIGN_CERT || path.join(__dirname, '..', 'server.crt');
const key = process.env.SIGN_KEY || path.join(__dirname, '..', 'server.key');
const options = {
	key: fs.readFileSync(key),
	cert: fs.readFileSync(cert),
};

const server = {
	http: require('http')
		.createServer()
		.on('request', proxy.core.mitm)
		.on('connect', proxy.core.tunnel),
	https: require('https')
		.createServer(options)
		.on('request', proxy.core.mitm)
		.on('connect', proxy.core.tunnel),
};

server.whitelist = [];
server.blacklist = ['://127\\.\\d+\\.\\d+\\.\\d+', '://localhost'];
server.authentication = null;

module.exports = server;
