const { getManagedCacheStorage, CacheStorageGroup } = require('./cache');
const parse = require('url').parse;
require('./provider/insure').disable = true;

const router = require('./consts').PROVIDERS;
const cs = getManagedCacheStorage('bridge');
cs.aliveDuration = 15 * 60 * 1000;

const distribute = (url, router) =>
	Promise.resolve().then(() => {
		const route = url.pathname
			.slice(1)
			.split('/')
			.map((path) => decodeURIComponent(path));
		let pointer = router,
			argument = decodeURIComponent(url.query);
		try {
			argument = JSON.parse(argument);
		} catch (e) {}
		const miss = route.some((path) => {
			if (path in pointer) pointer = pointer[path];
			else return true;
		});
		if (miss || typeof pointer != 'function') return Promise.reject();

		return cs.cache(argument, () => pointer(argument));
	});

// Start the "Clean Cache" background task.
const csgInstance = CacheStorageGroup.getInstance();
setInterval(
	() => {
		csgInstance.cleanup();
	},
	15 * 60 * 1000
);

require('http')
	.createServer()
	.listen(parseInt(process.argv[2]) || 9000)
	.on('request', (req, res) =>
		distribute(parse(req.url), router)
			.then((data) => res.write(data))
			.catch(() => res.writeHead(404))
			.then(() => res.end())
	);
