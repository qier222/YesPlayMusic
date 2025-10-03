const packageJson = require('../package.json');
const config = require('./cli.js')
	.program({
		name: packageJson.name.replace(/@.+\//, ''),
		version: packageJson.version,
	})
	.option(['-v', '--version'], { action: 'version' })
	.option(['-p', '--port'], {
		metavar: 'http[:https]',
		help: 'specify server port',
	})
	.option(['-a', '--address'], {
		metavar: 'address',
		help: 'specify server host',
	})
	.option(['-u', '--proxy-url'], {
		metavar: 'url',
		help: 'request through upstream proxy',
	})
	.option(['-f', '--force-host'], {
		metavar: 'host',
		help: 'force the netease server ip',
	})
	.option(['-o', '--match-order'], {
		metavar: 'source',
		nargs: '+',
		help: 'set priority of sources',
	})
	.option(['-t', '--token'], {
		metavar: 'token',
		help: 'set up proxy authentication',
	})
	.option(['-e', '--endpoint'], {
		metavar: 'url',
		help: 'replace virtual endpoint with public host',
	})
	.option(['-s', '--strict'], {
		action: 'store_true',
		help: 'enable proxy limitation',
	})
	.option(['-c', '--cnrelay'], {
		metavar: 'cnrelay',
		help: 'Mainland China relay to get music url',
	})
	.option(['-h', '--help'], { action: 'help' })
	.parse(process.argv);

global.address = config.address;
config.port = (config.port || '8080:8081')
	.split(':')
	.map((string) => parseInt(string));
const invalid = (value) => isNaN(value) || value < 1 || value > 65535;
if (config.port.some(invalid)) {
	console.log('Port must be a number higher than 0 and lower than 65535.');
	process.exit(1);
}
if (config.proxyUrl && !/http(s?):\/\/.+:\d+/.test(config.proxyUrl)) {
	console.log('Please check the proxy url.');
	process.exit(1);
}
if (!config.endpoint) config.endpoint = 'https://music.163.com';
else if (config.endpoint === '-') config.endpoint = '';
else if (!/http(s?):\/\/.+/.test(config.endpoint)) {
	console.log('Please check the endpoint host.');
	process.exit(1);
}
if (config.forceHost && require('net').isIP(config.forceHost) === 0) {
	console.log('Please check the server host.');
	process.exit(1);
}
if (config.matchOrder) {
	const provider = Object.keys(require('./consts').PROVIDERS);
	const candidate = config.matchOrder;
	if (candidate.some((key, index) => index != candidate.indexOf(key))) {
		console.log('Please check the duplication in match order.');
		process.exit(1);
	} else if (candidate.some((key) => !provider.includes(key))) {
		console.log('Please check the availability of match sources.');
		process.exit(1);
	}
	global.source = candidate;
}
if (config.token && !/\S+:\S+/.test(config.token)) {
	console.log('Please check the authentication token.');
	process.exit(1);
}

const { logScope } = require('./logger');
const parse = require('url').parse;
const hook = require('./hook');
const server = require('./server');
const { CacheStorageGroup } = require('./cache');
const logger = logScope('app');
const random = (array) => array[Math.floor(Math.random() * array.length)];
const target = Array.from(hook.target.host);

global.port = config.port;
global.proxy = config.proxyUrl ? parse(config.proxyUrl) : null;
global.hosts = target.reduce(
	(result, host) => Object.assign(result, { [host]: config.forceHost }),
	{}
);
server.whitelist = [
	'://[\\w.]*music\\.126\\.net',
	'://[\\w.]*vod\\.126\\.net',
	'://acstatic-dun.126.net',
	'://[\\w.]*\\.netease.com',
	'://[\\w.]*\\.163yun.com',
];
global.cnrelay = config.cnrelay;
if (config.strict) server.blacklist.push('.*');
server.authentication = config.token || null;
global.endpoint = config.endpoint;
if (config.endpoint) server.whitelist.push(escape(config.endpoint));

// hosts['music.httpdns.c.163.com'] = random(['59.111.181.35', '59.111.181.38'])
// hosts['httpdns.n.netease.com'] = random(['59.111.179.213', '59.111.179.214'])

const dns = (host) =>
	new Promise((resolve, reject) =>
		require('dns').lookup(host, { all: true }, (error, records) =>
			error
				? reject(error)
				: resolve(records.map((record) => record.address))
		)
	);
const httpdns = (host) =>
	require('./request')('POST', 'http://music.httpdns.c.163.com/d', {}, host)
		.then((response) => response.json())
		.then((jsonBody) =>
			jsonBody.dns.reduce(
				(result, domain) => result.concat(domain.ips),
				[]
			)
		);
const httpdns2 = (host) =>
	require('./request')(
		'GET',
		'http://httpdns.n.netease.com/httpdns/v2/d?domain=' + host
	)
		.then((response) => response.json())
		.then((jsonBody) =>
			Object.keys(jsonBody.data)
				.map((key) => jsonBody.data[key])
				.reduce((result, value) => result.concat(value.ip || []), [])
		);

// Allow enabling HTTPDNS queries with `ENABLE_HTTPDNS=true`
// It seems broken - BETTER TO NOT ENABLE IT!
const dnsSource =
	process.env.ENABLE_HTTPDNS === 'true' ? [httpdns, httpdns2] : [];

// Start the "Clean Cache" background task.
const csgInstance = CacheStorageGroup.getInstance();
setInterval(
	() => {
		csgInstance.cleanup();
	},
	15 * 60 * 1000
);

Promise.all(
	dnsSource.map((query) => query(target.join(','))).concat(target.map(dns))
)
	.then((result) => {
		const { host } = hook.target;
		result.forEach((array) => array.forEach(host.add, host));
		server.whitelist = server.whitelist.concat(
			Array.from(host).map(escape)
		);
		const log = (type) =>
			logger.info(
				`${['HTTP', 'HTTPS'][type]} Server running @ http://${
					address || '0.0.0.0'
				}:${port[type]}`
			);
		if (port[0])
			server.http
				.listen(port[0], address)
				.once('listening', () => log(0));
		if (port[1])
			server.https
				.listen(port[1], address)
				.once('listening', () => log(1));
		if (cnrelay) logger.info(`CNRelay: ${cnrelay}`);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
