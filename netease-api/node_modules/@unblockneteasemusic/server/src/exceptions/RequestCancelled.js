class RequestCancelled extends Error {
	/**
	 * @param {string} url
	 */
	constructor(url) {
		super(`This request URL has been cancelled: ${url}`);
		this.name = 'RequestCancelled';
	}
}

module.exports = RequestCancelled;
