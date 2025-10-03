const insure = require('./insure');
const select = require('./select');
const crypto = require('../crypto');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const format = (song) => ({
	id: song.MUSICRID.split('_').pop(),
	name: song.SONGNAME,
	// duration: song.songTimeMinutes.split(':').reduce((minute, second) => minute * 60 + parseFloat(second), 0) * 1000,
	duration: song.DURATION * 1000,
	album: { id: song.ALBUMID, name: song.ALBUM },
	artists: song.ARTIST.split('&').map((name, index) => ({
		id: index ? null : song.ARTISTID,
		name,
	})),
});

const search = (info) => {
	// const keyword = encodeURIComponent(info.keyword.replace(' - ', ' '));
	// const url = `http://www.kuwo.cn/api/www/search/searchMusicBykeyWord?key=${keyword}&pn=1&rn=30`;
	// const cookie = process.env.KUWO_COOKIE || null;

	// return request('GET', url, {
	// 	referer: `http://www.kuwo.cn/search/list?key=${keyword}`,
	// 	secret: cookie
	// 		? (cookie.match(/Secret=([0-9a-f]{72})/) || [])[1]
	// 		: null,
	// 	cookie,
	// })
	// 	.then((response) => response.json())
	// 	.then((jsonBody) => {
	// 		if (!jsonBody || jsonBody.code !== 200 || jsonBody.data.total < 1)
	// 			return Promise.reject();
	// 		const list = jsonBody.data.list.map(format);
	// 		const matched = select(list, info);
	// 		return matched ? matched.id : Promise.reject();
	// 	});

	const keyword = encodeURIComponent(info.keyword.replace(' - ', ' '));
	const url =
		'http://search.kuwo.cn/r.s?&correct=1&vipver=1&stype=comprehensive&encoding=utf8' +
		'&rformat=json&mobi=1&show_copyright_off=1&searchapi=6&all=' +
		keyword;

	return request('GET', url)
		.then((response) => response.json())
		.then((jsonBody) => {
			if (
				!jsonBody ||
				jsonBody.content.length < 2 ||
				!jsonBody.content[1].musicpage ||
				jsonBody.content[1].musicpage.abslist.length < 1
			)
				return Promise.reject();
			const list = jsonBody.content[1].musicpage.abslist.map(format);
			const matched = select(list, info);
			return matched ? matched.id : Promise.reject();
		});
};

const track = (id) => {
	const url = crypto.kuwoapi
		? 'http://mobi.kuwo.cn/mobi.s?f=kuwo&q=' +
			crypto.kuwoapi.encryptQuery(
				'corp=kuwo&source=kwplayer_ar_5.1.0.0_B_jiakong_vh.apk&p2p=1&type=convert_url2&sig=0&format=' +
					['flac', 'mp3']
						.slice(select.ENABLE_FLAC ? 0 : 1)
						.join('|') +
					'&rid=' +
					id
			)
		: 'http://antiserver.kuwo.cn/anti.s?type=convert_url&format=mp3&response=url&rid=MUSIC_' +
			id; // flac refuse
	// : 'http://www.kuwo.cn/url?format=mp3&response=url&type=convert_url3&br=320kmp3&rid=' + id // flac refuse

	return request('GET', url, { 'user-agent': 'okhttp/3.10.0' })
		.then((response) => response.body())
		.then((body) => {
			const url = (body.match(/http[^\s$"]+/) || [])[0];
			return url || Promise.reject();
		})
		.catch(() => insure().kuwo.track(id));
};

const cs = getManagedCacheStorage('provider/kuwo');
const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, track };
