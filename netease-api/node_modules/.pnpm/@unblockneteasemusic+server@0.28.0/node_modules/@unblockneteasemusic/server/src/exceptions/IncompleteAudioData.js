class IncompleteAudioData extends Error {
	/**
	 * @param {string} details
	 */
	constructor(details) {
		super(`The audio data is incomplete: ${details}`);
		this.name = 'IncompleteAudioData';
	}
}

module.exports = IncompleteAudioData;
