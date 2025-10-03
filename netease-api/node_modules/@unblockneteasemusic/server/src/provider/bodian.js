const insure = require('./insure');
const select = require('./select');
const crypto = require('../crypto');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');
const { logScope } = require('../logger');

const logger = logScope('provider/bodian');

function getRandomDeviceId() {
	const min = 0;
	const max = 100000000000;
	const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomNum.toString();
}
const deviceId = getRandomDeviceId();
// const deviceId = crypto.random.uuid();

const format = (song) => ({
	id: song.MUSICRID.split('_').pop(),
	name: song.SONGNAME,
	duration: song.DURATION * 1000,
	album: { id: song.ALBUMID, name: song.ALBUM },
	artists: song.ARTIST.split('&').map((name, index) => ({
		id: index ? null : song.ARTISTID,
		name,
	})),
});

const generateSign = (str) => {
	const url = new URL(str);

	const currentTime = Date.now();
	str += `&timestamp=${currentTime}`;

	const filteredChars = str
		.substring(str.indexOf('?') + 1)
		.replace(/[^a-zA-Z0-9]/g, '')
		.split('')
		.sort();

	const dataToEncrypt = `kuwotest${filteredChars.join('')}${url.pathname}`;
	const md5 = crypto.md5.digest(dataToEncrypt);
	return `${str}&sign=${md5}`;
};

const search = (info) => {
	const keyword = encodeURIComponent(info.keyword.replace(' - ', ' '));
	const searchUrl =
		'http://search.kuwo.cn/r.s?&correct=1&vipver=1&stype=comprehensive&encoding=utf8' +
		'&rformat=json&mobi=1&show_copyright_off=1&searchapi=6&all=' +
		keyword;

	return request('GET', searchUrl)
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

const sendAdFreeRequest = () => {
	const adurl =
		'http://bd-api.kuwo.cn/api/service/advert/watch?uid=-1&token=&timestamp=1724306124436&sign=15a676d66285117ad714e8c8371691da';

	const headers = {
		'user-agent': 'Dart/2.19 (dart:io)',
		plat: 'ar',
		channel: 'aliopen',
		devid: deviceId,
		ver: '3.9.0',
		host: 'bd-api.kuwo.cn',
		qimei36: '1e9970cbcdc20a031dee9f37100017e1840e',
		'content-type': 'application/json; charset=utf-8',
	};

	const data = JSON.stringify({
		type: 5,
		subType: 5,
		musicId: 0,
		adToken: '',
	});

	return request('POST', adurl, headers, data)
		.then((response) => response.body())
		.then((jsonBody) =>
			logger.debug(`bodian ad free response: ${jsonBody}`)
		);
};

const track = (id) => {
	const headers = {
		'user-agent': 'Dart/2.19 (dart:io)',
		plat: 'ar',
		channel: 'aliopen',
		devid: deviceId,
		ver: '3.9.0',
		host: 'bd-api.kuwo.cn',
		'X-Forwarded-For': '1.0.1.114',
	};

	let audioUrl = `http://bd-api.kuwo.cn/api/play/music/v2/audioUrl?&br=${
		select.ENABLE_FLAC ? '2000kflac' : '320kmp3'
	}&musicId=${id}`;
	audioUrl = generateSign(audioUrl);

	return sendAdFreeRequest().then(() =>
		request('GET', audioUrl, headers)
			.then((response) => response.json())
			.then((jsonBody) => {
				if (
					!jsonBody ||
					jsonBody.code !== 200 ||
					typeof jsonBody.data !== 'object'
				)
					return Promise.reject();
				return jsonBody.data.audioUrl || Promise.reject();
			})
			.catch(() => insure().bodian.track(id))
	);
};

const cs = getManagedCacheStorage('provider/bodian');

const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, track };
