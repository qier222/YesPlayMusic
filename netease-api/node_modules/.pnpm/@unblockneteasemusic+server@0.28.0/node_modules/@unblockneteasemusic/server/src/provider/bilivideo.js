const {
	cacheStorage,
	CacheStorageGroup,
	getManagedCacheStorage,
} = require('../cache');
const insure = require('./insure');
const select = require('./select');
const request = require('../request');
const crypto = require('../crypto');
const { logScope } = require('../logger');

const logger = logScope('provider/bilivideo');
const cs = getManagedCacheStorage('provider/bilivideo');

//Wbi 和 API 部分参考： https://github.com/SocialSisterYi/bilibili-API-collect

const mixinKeyEncTab = [
	46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
	33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
	61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
	36, 20, 34, 44, 52,
];

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig) =>
	mixinKeyEncTab
		.map((n) => orig[n])
		.join('')
		.slice(0, 32);

// 为请求参数进行 wbi 签名
function encWbi(params, img_key, sub_key) {
	const mixin_key = getMixinKey(img_key + sub_key),
		curr_time = Math.round(Date.now() / 1000),
		chr_filter = /[!'()*]/g;

	Object.assign(params, { wts: curr_time }); // 添加 wts 字段
	// 按照 key 重排参数
	const query = Object.keys(params)
		.sort()
		.map((key) => {
			// 过滤 value 中的 "!'()*" 字符
			const value = params[key].toString().replace(chr_filter, '');
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		})
		.join('&');

	const wbi_sign = crypto.md5.digest(query + mixin_key); // 计算 w_rid

	return query + '&w_rid=' + wbi_sign;
}

// 获取最新的 img_key 和 sub_key
async function getWbiKeys() {
	const res = await request(
		'GET',
		'https://api.bilibili.com/x/web-interface/nav',
		{
			// SESSDATA 字段
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
			Referer: 'https://www.bilibili.com/', //对于直接浏览器调用可能不适用
		}
	);
	const {
		data: {
			wbi_img: { img_url, sub_url },
		},
	} = await res.json();

	return {
		img_key: img_url.slice(
			img_url.lastIndexOf('/') + 1,
			img_url.lastIndexOf('.')
		),
		sub_key: sub_url.slice(
			sub_url.lastIndexOf('/') + 1,
			sub_url.lastIndexOf('.')
		),
	};
}

const signParam = async (param) => {
	const { img_key, sub_key } = await cs.cache(
		'wbikey',
		async () => await getWbiKeys()
	);

	return encWbi(param, img_key, sub_key);
};

const format = (song) => {
	return {
		id: song.bvid,
		name: song.title,
		// album: {id: song.album_id, name: song.album_title},
		artists: { id: song.typeid, name: song.typename },
	};
};

const getBiliVideoHeader = async () => {
	const url = 'https://www.bilibili.com';

	return cs.cache('bilicookie', () =>
		request('GET', url).then((response) =>
			response.headers['set-cookie']
				.map((cookie) => cookie.split(';')[0])
				.join('; ')
		)
	);
};

const search = (info) => {
	return getBiliVideoHeader().then((cookies) => {
		return signParam({
			search_type: 'video',
			keyword: info.keyword,
		}).then((param) => {
			const url =
				'https://api.bilibili.com/x/web-interface/wbi/search/type?' +
				param;
			return request('GET', url, {
				cookie: cookies,
				referer: 'https://search.bilibili.com',
			})
				.then((response) => response.json())
				.then((jsonBody) => {
					const list = jsonBody.data.result.map(format);
					const matched = select(list, info);

					return matched ? matched.id : Promise.reject();
				});
		});
	});
};

const track = (id) => {
	return signParam({ bvid: id }).then((param) => {
		const url =
			'https://api.bilibili.com/x/web-interface/wbi/view?' + param;

		return request('GET', url)
			.then((response) => response.json())
			.then((jsonBody) => {
				if (jsonBody.code === 0) {
					// bilibili music requires referer, connect do not support referer, so change to http

					return signParam({
						bvid: id,
						cid: jsonBody.data.cid,
						fnval: 16,
						platform: 'pc',
					}).then((param) => {
						const url =
							'https://api.bilibili.com/x/player/wbi/playurl?' +
							param;

						return request('GET', url)
							.then((response) => response.json())
							.then((jsonBody) => {
								if (jsonBody.code === 0) {
									if (jsonBody.data.dash.audio != null) {
										return jsonBody.data.dash.audio[0]
											.base_url;
									}
									return Promise.reject();
								} else {
									return Promise.reject();
								}
							})
							.catch(() => insure().bilibili.track(id));
					});
				} else {
					return Promise.reject();
				}
			})
			.catch(() => insure().bilibili.track(id));
	});
};

const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check, track };
