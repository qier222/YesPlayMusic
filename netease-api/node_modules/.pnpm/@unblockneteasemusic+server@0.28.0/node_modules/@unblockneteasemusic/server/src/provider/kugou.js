const insure = require('./insure');
const select = require('./select');
const crypto = require('../crypto');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const format = (song) => {
	return {
		// id: song.FileHash,
		// name: song.SongName,
		// duration: song.Duration * 1000,
		// album: {id: song.AlbumID, name: song.AlbumName},
		// artists: song.SingerId.map((id, index) => ({id, name: SingerName[index]}))
		id: song['hash'],
		id_hq: song['320hash'],
		id_sq: song['sqhash'],
		name: song['songname'],
		duration: song['duration'] * 1000,
		album: { id: song['album_id'], name: song['album_name'] },
	};
};

const search = (info) => {
	const url =
		// 'http://songsearch.kugou.com/song_search_v2?' +
		'http://mobilecdn.kugou.com/api/v3/search/song?' +
		'keyword=' +
		encodeURIComponent(info.keyword) +
		'&page=1&pagesize=10';

	return request('GET', url)
		.then((response) => response.json())
		.then((jsonBody) => {
			// const list = jsonBody.data.lists.map(format)
			const list = jsonBody.data.info.map(format);
			const matched = select(list, info);
			return matched ? matched : Promise.reject();
		})
		.catch(() => insure().kugou.search(info));
};

const single = (song, format) => {
	const getHashId = () => {
		switch (format) {
			case 'hash':
				return song.id;
			case 'hqhash':
				return song.id_hq;
			case 'sqhash':
				return song.id_sq;
			default:
				break;
		}
		return '';
	};

	const url =
		'http://trackercdn.kugou.com/i/v2/?' +
		'key=' +
		crypto.md5.digest(`${getHashId()}kgcloudv2`) +
		'&hash=' +
		getHashId() +
		'&' +
		'appid=1005&pid=2&cmd=25&behavior=play&album_id=' +
		song.album.id;
	return request('GET', url)
		.then((response) => response.json())
		.then((jsonBody) => jsonBody.url[0] || Promise.reject());
};

const track = (song) =>
	Promise.all(
		['sqhash', 'hqhash', 'hash']
			.slice(select.ENABLE_FLAC ? 0 : 1)
			.map((format) => single(song, format).catch(() => null))
	)
		.then((result) => result.find((url) => url) || Promise.reject())
		.catch(() => insure().kugou.track(song));

const cs = getManagedCacheStorage('provider/kugou');
const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, search };
