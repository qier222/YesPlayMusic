const {
	cacheStorage,
	CacheStorageGroup,
	getManagedCacheStorage,
} = require('../cache');
const insure = require('./insure');
const select = require('./select');
const request = require('../request');

const format = (song) => {
	return {
		id: song.id,
		name: song.title,
		// album: {id: song.album_id, name: song.album_title},
		artists: { id: song.mid, name: song.author },
	};
};

const search = (info) => {
	const url =
		'https://api.bilibili.com/audio/music-service-c/s?' +
		'search_type=music&page=1&pagesize=30&' +
		`keyword=${encodeURIComponent(info.keyword)}`;
	return request('GET', url)
		.then((response) => response.json())
		.then((jsonBody) => {
			const list = jsonBody.data.result.map(format);
			const matched = select(list, info);
			return matched ? matched.id : Promise.reject();
		});
};

const track = (id) => {
	const url =
		'https://www.bilibili.com/audio/music-service-c/web/url?rivilege=2&quality=2&' +
		'sid=' +
		id;

	return request('GET', url)
		.then((response) => response.json())
		.then((jsonBody) => {
			if (jsonBody.code === 0) {
				// bilibili music requires referer, connect do not support referer, so change to http
				return jsonBody.data.cdns[0].replace('https', 'http');
			} else {
				return Promise.reject();
			}
		})
		.catch(() => insure().bilibili.track(id));
};

const cs = getManagedCacheStorage('provider/bilibili');
const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, track };
