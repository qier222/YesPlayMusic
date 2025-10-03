class RequestFailed extends Error {
	/**
	 * @param {string} url
	 * @param {number} code
	 */
	constructor(url, code) {
		super(`Failed to get the response. Status code: ${code}`);
		this.url = url;
		this.code = code;
		this.name = 'RequestFailed';
	}
}

module.exports = RequestFailed;
