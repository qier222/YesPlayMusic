class SongNotAvailable extends Error {
	/**
	 * @param {string} source
	 * @param {string?} song
	 */
	constructor(source, song = '?') {
		super(`This song "${song}" is not available in ${source}`);
		this.name = 'SongNotAvailable';
	}
}

module.exports = SongNotAvailable;
