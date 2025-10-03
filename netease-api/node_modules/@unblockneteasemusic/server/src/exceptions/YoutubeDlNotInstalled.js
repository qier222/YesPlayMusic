class YoutubeDlNotInstalled extends Error {
	constructor() {
		super(
			`You must install "youtube-dl" before using the "youtubedl" source.`
		);
		this.name = 'YoutubeDlNotInstalled';
	}
}

module.exports = YoutubeDlNotInstalled;
