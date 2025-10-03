const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const filter = (object, keys) =>
	Object.keys(object).reduce(
		(result, key) =>
			Object.assign(result, keys.includes(key) && { [key]: object[key] }),
		{}
	);
// Object.keys(object).filter(key => !keys.includes(key)).forEach(key => delete object[key])

const limit = (text) => {
	const output = [text[0]];
	const length = () => output.reduce((sum, token) => sum + token.length, 0);
	text.slice(1).some((token) => {
		if (length() > 15) return true;

		output.push(token);
		return false;
	});
	return output;
};

const getFormatData = (data) => {
	try {
		const info = filter(data, ['id', 'name', 'alias', 'duration']);
		info.name = (info.name || '')
			.replace(/（\s*cover[:：\s][^）]+）/i, '')
			.replace(/\(\s*cover[:：\s][^)]+\)/i, '')
			.replace(/（\s*翻自[:：\s][^）]+）/, '')
			.replace(/\(\s*翻自[:：\s][^)]+\)/, '');
		info.album = filter(data.album, ['id', 'name']);
		info.artists = data.artists.map((artist) =>
			filter(artist, ['id', 'name'])
		);
		info.keyword =
			info.name +
			' - ' +
			limit(info.artists.map((artist) => artist.name)).join(' / ');
		if (process.env.SEARCH_ALBUM === 'true') {
			let album = info.album?.name;
			if (album && album !== info.name) {
				info.keyword += ` ${album}`;
			}
		}
		return info;
	} catch (err) {
		console.log('getFormatData err: ', err);
		return {};
	}
};

const find = (id, data) => {
	if (data) {
		const info = getFormatData(data);
		return info.name ? Promise.resolve(info) : Promise.reject();
	} else {
		const url = 'https://music.163.com/api/song/detail?ids=[' + id + ']';
		return request('GET', url)
			.then((response) => response.json())
			.then((jsonBody) => {
				if (jsonBody && jsonBody.songs && jsonBody.songs.length) {
					const info = getFormatData(jsonBody.songs[0]);
					return info.name ? info : Promise.reject();
				}
				return Promise.reject();
			});
	}
};

const cs = getManagedCacheStorage('provider/find');

module.exports = (id, data) => {
	if (data) {
		return find(id, data);
	} else {
		return cs.cache(id, () => find(id));
	}
};
