const insure = require('./insure');
const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const headers = {
	origin: 'http://music.migu.cn/',
	referer: 'http://m.music.migu.cn/v3/',
	// cookie: 'migu_music_sid=' + (process.env.MIGU_COOKIE || null),
	aversionid: process.env.MIGU_COOKIE || null,
	channel: '0146921',
};

const format = (song) => {
	const singerId = song.singerId.split(/\s*,\s*/);
	const singerName = song.singerName.split(/\s*,\s*/);
	return {
		// id: song.copyrightId,
		id: song.id,
		name: song.title,
		album: { id: song.albumId, name: song.albumName },
		artists: singerId.map((id, index) => ({ id, name: singerName[index] })),
	};
};

const search = (info) => {
	const url =
		'https://m.music.migu.cn/migu/remoting/scr_search_tag?' +
		'keyword=' +
		encodeURIComponent(info.keyword) +
		'&type=2&rows=20&pgc=1';

	return request('GET', url, headers)
		.then((response) => response.json())
		.then((jsonBody) => {
			const list = ((jsonBody || {}).musics || []).map(format);
			const matched = select(list, info);
			return matched ? matched.id : Promise.reject();
		});
};

const single = (id, format) => {
	// const url =
	//	'https://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo?' +
	//	'dataType=2&' + crypto.miguapi.encryptBody({copyrightId: id.toString(), type: format})

	const url =
		'https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.4?' +
		'netType=01&resourceType=2&songId=' +
		id.toString() +
		'&toneFlag=' +
		format;

	return request('GET', url, headers)
		.then((response) => response.json())
		.then((jsonBody) => {
			// const {playUrl} = jsonBody.data
			// return playUrl ? encodeURI('http:' + playUrl) : Promise.reject()
			const { audioFormatType } = jsonBody.data;
			if (audioFormatType !== format) return Promise.reject();
			else return url ? jsonBody.data.url : Promise.reject();
		});
};

const track = (id) =>
	Promise.all(
		// [3, 2, 1].slice(select.ENABLE_FLAC ? 0 : 1)
		['ZQ24', 'SQ', 'HQ', 'PQ']
			.slice(select.ENABLE_FLAC ? 0 : 2)
			.map((format) => single(id, format).catch(() => null))
	)
		.then((result) => result.find((url) => url) || Promise.reject())
		.catch(() => insure().migu.track(id));

const cs = getManagedCacheStorage('provider/migu');
const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, track };
