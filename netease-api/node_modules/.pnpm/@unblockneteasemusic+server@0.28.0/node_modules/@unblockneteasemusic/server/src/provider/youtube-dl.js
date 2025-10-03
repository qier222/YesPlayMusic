const { getManagedCacheStorage } = require('../cache');
const { logScope } = require('../logger');
const YoutubeDlInvalidResponse = require('../exceptions/YoutubeDlInvalidResponse');
const YoutubeDlNotInstalled = require('../exceptions/YoutubeDlNotInstalled');
const { spawnStdout } = require('../spawn');

/**
 * The arguments to pass to youtube-dl
 *
 * ```plain
 * youtube-dl -f bestaudio --dump-json <query>
 *		-f bestaudio 	choose the best quality of the audio
 *		--dump-json		dump the information as JSON without downloading it
 * ```
 *
 * @param {string} query
 */
const dlArguments = (query) => ['-f', '140', '--dump-json', query];
/** @param {string} keyword */
const byKeyword = (keyword) => `ytsearch1:${keyword}`;
const logger = logScope('provider/youtube-dl');

/**
 * Checking if youtube-dl is available,
 * then execute the command and extract the ID and URL.
 *
 * @param {string[]} args
 * @returns {Promise<{id: string, url: string}>}
 */
async function getUrl(args) {
	try {
		const { stdout } = await spawnStdout('youtube-dl', args);
		const response = JSON.parse(stdout.toString());
		if (
			typeof response === 'object' &&
			typeof response.id === 'string' &&
			typeof response.url === 'string'
		)
			return response;

		throw new YoutubeDlInvalidResponse(response);
	} catch (e) {
		if (e && e.code === 'ENOENT') throw new YoutubeDlNotInstalled();
		throw e;
	}
}

const track = async (info) => {
	const { url } = await getUrl(dlArguments(byKeyword(info.keyword)));
	return url;
};

const cs = getManagedCacheStorage('youtube-dl');
const check = (info) =>
	cs
		.cache(info, () => track(info))
		.catch((e) => {
			if (e) logger.error(e);
			throw e;
		});

module.exports = { check };
