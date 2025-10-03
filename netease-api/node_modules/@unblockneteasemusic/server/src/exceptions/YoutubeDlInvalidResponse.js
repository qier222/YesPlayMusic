class YoutubeDlInvalidResponse extends Error {
	constructor(response) {
		super(`The response of youtube-dl is malformed.`);
		this.name = 'YoutubeDlInvalidResponse';
		this.response = response;
	}
}

module.exports = YoutubeDlInvalidResponse;
