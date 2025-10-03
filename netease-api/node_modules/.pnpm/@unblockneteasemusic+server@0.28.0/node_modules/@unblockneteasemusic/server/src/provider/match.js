const find = require('./find');
const request = require('../request');
const {
	PROVIDERS: providers,
	DEFAULT_SOURCE: defaultSrc,
} = require('../consts');
const { isHostWrapper } = require('../utilities');
const SongNotAvailable = require('../exceptions/SongNotAvailable');
const RequestFailed = require('../exceptions/RequestFailed');
const IncompleteAudioData = require('../exceptions/IncompleteAudioData');
const { logScope } = require('../logger');
const RequestCancelled = require('../exceptions/RequestCancelled');

const logger = logScope('provider/match');

/**
 * Is this http request success?
 *
 * @param {number} code The HTTP status code.
 */
const isHttpResponseOk = (code) => code >= 200 && code <= 299;

/** @type {Map<string, string>} */
const headerReferer = new Map([
	['bilivideo.com', 'https://www.bilibili.com/'],
	['upos-hz-mirrorakam.akamaized.net', 'https://www.bilibili.com/'],
]);

/**
 * @typedef {{ size: number, br: number | null, url: string | null, md5: string | null, source: string }} AudioData
 */

/**
 * Get the audio URL from the specified source.
 *
 * @param {string} source The source to fetch the audio URL.
 * @param {Record<string, unknown>} info The music metadata from Netease Music.
 * @return {Promise<AudioData>}
 */
async function getAudioFromSource(source, info) {
	logger.debug({ source, info }, 'Getting the audio...');
	// Check if this song is available in the specified source.
	const audioData = await providers[source].check(info);
	if (!audioData) throw new SongNotAvailable(source);

	// Get the url from the song data.
	const song = await check(audioData);
	logger.debug(song, 'The matched song is:');
	if (!song || typeof song.url !== 'string')
		throw new IncompleteAudioData(
			'song is undefined, or song.url is not a string.'
		);

	logger.debug({ source, info }, 'The audio matched!');
	return {
		...song,
		source,
	};
}

async function match(id, source, data) {
	const candidate = (source || global.source || defaultSrc).filter(
		(name) => name in providers
	);

	const audioInfo = await find(id, data);
	let audioData = null;

	if (process.env.SELECT_MAX_BR) {
		let audioDataArr = await Promise.allSettled(
			candidate.map(async (source) =>
				getAudioFromSource(source, audioInfo).catch((e) => {
					if (e) {
						if (e instanceof RequestCancelled) logger.debug(e);
						else logger.error(e);
					}
					throw e; // We just log it instead of resolving it.
				})
			)
		);

		audioDataArr = audioDataArr.filter(
			(result) => result.status === 'fulfilled'
		);

		if (audioDataArr.length === 0) {
			throw new SongNotAvailable('any source');
		}

		audioDataArr = audioDataArr.map((result) => result.value);
		audioData = audioDataArr.reduce((a, b) => (a.br >= b.br ? a : b));
	} else if (process.env.FOLLOW_SOURCE_ORDER) {
		for (let i = 0; i < candidate.length; i++) {
			const source = candidate[i];
			try {
				audioData = await getAudioFromSource(source, audioInfo);
				break;
			} catch (e) {
				if (e) {
					if (e instanceof RequestCancelled) logger.debug(e);
					else logger.error(e);
				}
			}
		}

		if (!audioData) {
			throw 'No audioData!';
		}
	} else {
		audioData = await Promise.any(
			candidate.map(async (source) =>
				getAudioFromSource(source, audioInfo).catch((e) => {
					if (e) {
						if (e instanceof RequestCancelled) logger.debug(e);
						else logger.error(e);
					}
					throw e; // We just log it instead of resolving it.
				})
			)
		);
	}

	const { id: audioId, name } = audioInfo;
	const { url } = audioData;
	logger.debug({ audioInfo, audioData }, 'The data to replace:');
	logger.info(
		{
			audioId,
			songName: name,
			url,
		},
		`Replaced: [${audioId}] ${name}`
	);
	return audioData;
}

/**
 * Check and get the audio info of URL.
 * @param url The URL to be fetched.
 * @return {Promise<AudioData>} The parsed audio data.
 */
async function check(url) {
	const isHost = isHostWrapper(url);
	const song = { size: 0, br: null, url: null, md5: null };
	const header = {
		range: 'bytes=0-8191',
		'accept-encoding': 'identity',
	};

	// Set the "Referer" header.
	headerReferer.forEach((refererValue, urlPattern) => {
		if (isHost(urlPattern)) header.referer = refererValue;
	});

	const response = await request('GET', url, header);
	const {
		/** @type {Record<string, string>} */
		headers,
	} = response;

	// Check if this request success.
	if (!isHttpResponseOk(response.statusCode))
		throw new RequestFailed(url, response.statusCode);

	// Set the URL of this song.
	song.url = response.url.href;

	// Get the bitrate of this song.
	const data = await response.body(true);

	try {
		const bitrate = decode(data);
		song.br = bitrate && !isNaN(bitrate) ? bitrate * 1000 : null;
	} catch (e) {
		logger.debug(e, 'Failed to decode and extract the bitrate');
	}

	if (!song.br) {
		if (isHost('qq.com') && song.url.includes('.m4a')) {
			//m4a is the lowest audio quality of qq music, usually 96kbps
			song.br = 96000;
		}

		if (isHost('bilivideo.com') && song.url.includes('.m4a')) {
			const result = song.url.match(/-(\d+)k\.m4a/);
			let bitrate = parseInt(result);

			if (isNaN(bitrate)) {
				bitrate = 192000;
			} else if (bitrate < 96 || bitrate > 999) {
				bitrate = 192000;
			} else {
				bitrate *= 1000;
			}

			song.br = bitrate;
		}

		if (isHost('googlevideo.com')) {
			song.br = 128000;
		}
	}

	// Check if "headers" existed. There are some edge cases
	// that the response has no headers, for example, the song
	// from YouTube.
	if (headers) {
		// Set the MD5 info of this song.
		if (isHost('126.net'))
			song.md5 = song.url.split('/').slice(-1)[0].replace(/\..*/g, '');
		if (isHost('qq.com')) song.md5 = headers['server-md5'];

		// Set the size info of this song.
		song.size =
			parseInt(
				(headers['content-range'] || '').split('/').pop() ||
					headers['content-length']
			) || 0;

		// Check if the Content-Length equals 8192.
		if (headers['content-length'] !== '8192') {
			// I'm not sure how to describe this.
			// Seems like not important.
			return Promise.reject();
		}
	}

	return song;
}

function decode(buffer) {
	const map = {
		3: {
			3: [
				'free',
				32,
				64,
				96,
				128,
				160,
				192,
				224,
				256,
				288,
				320,
				352,
				384,
				416,
				448,
				'bad',
			],
			2: [
				'free',
				32,
				48,
				56,
				64,
				80,
				96,
				112,
				128,
				160,
				192,
				224,
				256,
				320,
				384,
				'bad',
			],
			1: [
				'free',
				32,
				40,
				48,
				56,
				64,
				80,
				96,
				112,
				128,
				160,
				192,
				224,
				256,
				320,
				'bad',
			],
		},
		2: {
			3: [
				'free',
				32,
				48,
				56,
				64,
				80,
				96,
				112,
				128,
				144,
				160,
				176,
				192,
				224,
				256,
				'bad',
			],
			2: [
				'free',
				8,
				16,
				24,
				32,
				40,
				48,
				56,
				64,
				80,
				96,
				112,
				128,
				144,
				160,
				'bad',
			],
		},
	};
	map[2][1] = map[2][2];
	map[0] = map[2];

	let pointer = 0;
	if (buffer.slice(0, 4).toString() === 'fLaC') return 999;
	if (buffer.slice(0, 3).toString() === 'ID3') {
		pointer = 6;
		const size = buffer
			.slice(pointer, pointer + 4)
			.reduce(
				(summation, value, index) =>
					(summation + (value & 0x7f)) << (7 * (3 - index)),
				0
			);
		pointer = 10 + size;
	}
	const header = buffer.slice(pointer, pointer + 4);

	// https://www.allegro.cc/forums/thread/591512/674023
	if (
		header.length === 4 &&
		header[0] === 0xff &&
		((header[1] >> 5) & 0x7) === 0x7 &&
		((header[1] >> 1) & 0x3) !== 0 &&
		((header[2] >> 4) & 0xf) !== 0xf &&
		((header[2] >> 2) & 0x3) !== 0x3
	) {
		const version = (header[1] >> 3) & 0x3;
		const layer = (header[1] >> 1) & 0x3;
		const bitrate = header[2] >> 4;
		return map[version][layer][bitrate];
	}
}

module.exports = match;
