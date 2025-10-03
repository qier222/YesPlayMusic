class YtDlpInvalidResponse extends Error {
	constructor(response) {
		super(`The response of yt-dlp is malformed.`);
		this.name = 'YtDlpInvalidResponse';
		this.response = response;
	}
}

module.exports = YtDlpInvalidResponse;
