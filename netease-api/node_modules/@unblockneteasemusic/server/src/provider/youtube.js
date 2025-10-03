const request = require('../request');
const { getManagedCacheStorage } = require('../cache');
const parse = (query) =>
	(query || '').split('&').reduce((result, item) => {
		const splitItem = item.split('=').map(decodeURIComponent);
		return Object.assign({}, result, { [splitItem[0]]: splitItem[1] });
	}, {});

const cs = getManagedCacheStorage('provider/youtube');

// const proxy = require('url').parse('http://127.0.0.1:1080')
const proxy = undefined;
const key = process.env.YOUTUBE_KEY || null; // YouTube Data API v3

const signature = (id = '-tKVN2mAKRI') => {
	const url = `https://www.youtube.com/watch?v=${id}`;

	return request('GET', url, {}, null, proxy)
		.then((response) => response.body())
		.then((body) => {
			let assets =
				/"WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_VERTICAL_LANDING_PAGE_PROMO":{[^}]+}/.exec(
					body
				)[0];
			assets = JSON.parse(
				`{${assets}}}`
			).WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_VERTICAL_LANDING_PAGE_PROMO;
			return request(
				'GET',
				'https://youtube.com' + assets.jsUrl,
				{},
				null,
				proxy
			).then((response) => response.body());
		})
		.then((body) => {
			const [, funcArg, funcBody] =
				/function\((\w+)\)\s*{([^}]+split\(""\)[^}]+join\(""\))};/.exec(
					body
				);
			const helperName = /;(.+?)\..+?\(/.exec(funcBody)[1];
			const helperContent = new RegExp(
				`var ${helperName}={[\\s\\S]+?};`
			).exec(body)[0];
			return new Function([funcArg], helperContent + '\n' + funcBody);
		});
};

const apiSearch = (info) => {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
		info.keyword
	)}&type=video&key=${key}`;

	return request('GET', url, { accept: 'application/json' }, null, proxy)
		.then((response) => response.json())
		.then((jsonBody) => {
			const matched = jsonBody.items[0];
			if (matched) return matched.id.videoId;
			else return Promise.reject();
		});
};

const search = (info) => {
	const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
		info.keyword
	)}`;

	return request('GET', url, {}, null, proxy)
		.then((response) => response.body())
		.then((body) => {
			const initialData = JSON.parse(
				body.match(/ytInitialData\s*=\s*([^;]+);/)[1]
			);
			const matched =
				initialData.contents.twoColumnSearchResultsRenderer
					.primaryContents.sectionListRenderer.contents[0]
					.itemSectionRenderer.contents[1];
			if (matched) return matched.videoRenderer.videoId;
			else return Promise.reject();
		});
};

const track = (id) => {
	/*
	 * const url =
	 * 	'https://youtubei.googleapis.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
	 * const json_header = { 'Content-Type': 'application/json; charset=utf-8' };
	 * const json_body = `{
	 * 	"context": {
	 * 		"client": {
	 * 			"hl": "en",
	 * 			"clientName": "WEB",
	 * 			"clientVersion": "2.20210721.00.00"
	 * 		}
	 * 	},
	 * 	"videoId": "${id}"
	 * }`;
	 */

	const url = `https://www.youtube.com/watch?v=${id}`;
	return (
		// request('POST', url, json_header, json_body, proxy)
		request('GET', url, {}, null, proxy)
			.then((response) => response.body())
			// .then((body) => JSON.parse(body).streamingData)
			.then(
				(body) =>
					JSON.parse(
						body
							.match(
								/ytInitialPlayerResponse\s*=\s*{[^]+};\s*var\s*meta/
							)[0]
							.replace(/;var meta/, '')
							.replace(/ytInitialPlayerResponse = /, '')
					).streamingData
			)
			.then((streamingData) => {
				const stream = streamingData.formats
					.concat(streamingData.adaptiveFormats)
					.find((format) => format.itag === 140);
				// .filter(format => [249, 250, 140, 251].includes(format.itag)) // NetaseMusic PC client do not support webm format
				// .sort((a, b) => b.bitrate - a.bitrate)[0]
				const target = parse(stream.signatureCipher);
				return (
					stream.url ||
					(target.sp.includes('sig')
						? cs
								.cache(
									'YOUTUBE_SIGNATURE',
									() => signature(),
									Date.now() + 24 * 60 * 60 * 1000
								)
								.then(
									(sign) =>
										target.url + '&sig=' + sign(target.s)
								)
						: target.url)
				);
			})
	);
};

const check = (info) =>
	cs
		.cache(info, () => {
			if (key) return apiSearch(info);
			return search(info);
		})
		.then(track);

module.exports = { check, track };
