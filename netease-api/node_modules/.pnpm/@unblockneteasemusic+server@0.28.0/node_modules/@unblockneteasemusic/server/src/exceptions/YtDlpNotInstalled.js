class YtDlpNotInstalled extends Error {
	constructor() {
		super(`You must install "yt-dlp" before using the "ytdlp" source.`);
		this.name = 'YtDlpNotInstalled';
	}
}

module.exports = YtDlpNotInstalled;
