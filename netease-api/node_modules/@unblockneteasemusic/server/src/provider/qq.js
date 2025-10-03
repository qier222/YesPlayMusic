const insure = require('./insure');
const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

let COOKIE = process.env.NEW_QQ_COOKIE || process.env.QQ_COOKIE;
const headers = {
	origin: 'http://y.qq.com/',
	referer: 'http://y.qq.com/',
	cookie: COOKIE || null, // 'uin=; qm_keyst=',
};

const refresh = () => {
	const refresh_token =
		(COOKIE.match(/qqrefresh_token=([^;]*)/) || [])[1] || '';
	const musickey = (COOKIE.match(/qqmusic_key=([^;]*)/) || [])[1] || '';
	const musicid = parseInt((COOKIE.match(/uin=(\d+)/) || [])[1] || 0, 10);

	const body = {
		req: {
			module: 'music.login.LoginServer',
			method: 'Login',
			param: {
				refresh_token: refresh_token,
				musickey: musickey,
				musicid: musicid,
			},
		},
	};
	const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
	return request(
		'POST',
		url,
		{
			Cookie: COOKIE,
			'Content-Type': 'application/json',
		},
		JSON.stringify(body)
	)
		.then((response) => response.json())
		.then((jsonBody) => {
			const data = jsonBody.req?.data || {};
			const newMusickey = data.musickey;
			const newMusickeyCreateTime = data.musickeyCreateTime;
			if (!newMusickey || !newMusickeyCreateTime) return;
			let newCookie = COOKIE;
			newCookie = newCookie
				.replace(/(qqmusic_key=)[^;]*/, `$1${newMusickey}`)
				.replace(/(qm_keyst=)[^;]*/, `$1${newMusickey}`)
				.replace(
					/(psrf_musickey_createtime=)[^;]*/,
					`$1${newMusickeyCreateTime}`
				);
			process.env.NEW_QQ_COOKIE = newCookie;
			headers.cookie = newCookie;
			COOKIE = newCookie;
		});
};

const format = (song) => ({
	id: { song: song.mid, file: song.mid },
	name: song.name,
	duration: song.interval * 1000,
	album: { id: song.album.mid, name: song.album.name },
	artists: song.singer.map(({ mid, name }) => ({ id: mid, name })),
});

const search = (info) => {
	const url =
		'https://u.y.qq.com/cgi-bin/musicu.fcg?data=' +
		encodeURIComponent(
			JSON.stringify({
				search: {
					method: 'DoSearchForQQMusicDesktop',
					module: 'music.search.SearchCgiService',
					param: {
						num_per_page: 5,
						page_num: 1,
						query: info.keyword,
						search_type: 0,
					},
				},
			})
		);

	return request('GET', url, headers)
		.then((response) => response.json())
		.then((jsonBody) => {
			const result = jsonBody.search.data.body.song.list.map(format);
			const matched = select(result, info);
			return matched ? matched.id : Promise.reject();
		});
};

const single = (id, format) => {
	const uin = ((headers.cookie || '').match(/uin=(\d+)/) || [])[1] || '0';

	const url =
		'https://u.y.qq.com/cgi-bin/musicu.fcg?data=' +
		encodeURIComponent(
			JSON.stringify({
				req_0: {
					module: 'vkey.GetVkeyServer',
					method: 'CgiGetVkey',
					param: {
						guid: (Math.random() * 10000000).toFixed(0),
						loginflag: 1,
						filename: format[0] ? [format.join(id.file)] : null,
						songmid: [id.song],
						songtype: [0],
						uin,
						platform: '20',
					},
				},
			})
		);

	return request('GET', url, headers)
		.then((response) => response.json())
		.then((jsonBody) => {
			const { sip, midurlinfo } = jsonBody.req_0.data;
			if (!midurlinfo[0].purl) return Promise.reject();

			const playurl = sip[0] + midurlinfo[0].purl;
			const header = {
				range: 'bytes=0-8191',
				'accept-encoding': 'identity',
			};
			return request('GET', playurl, header).then((response) => {
				if (response.statusCode < 200 || response.statusCode > 299)
					return Promise.reject();
				else return playurl;
			});
		});
};

const track = (id) => {
	id.key = id.file;
	return Promise.all(
		[
			['F000', '.flac'],
			['M800', '.mp3'],
			['M500', '.mp3'],
			[null, null],
		]
			.slice(
				headers.cookie || typeof window !== 'undefined'
					? select.ENABLE_FLAC
						? 0
						: 1
					: 2
			)
			.map((format) => single(id, format).catch(() => null))
	)
		.then((result) => result.find((url) => url) || Promise.reject())
		.catch(() => insure().qq.track(id));
};

const cs = getManagedCacheStorage('provider/qq');
const check = (info) => {
	const now = Math.floor(Date.now() / 1000);
	const musickey_createtime =
		((COOKIE || '').match(/musickey_createtime=(\d+)/) || [])[1] || '';
	const createTime = parseInt(musickey_createtime, 10) + 259200;
	if (musickey_createtime && createTime - now < 600) refresh();
	return cs.cache(info, () => search(info)).then(track);
};

module.exports = { check, track };
