module.exports = (list, info) => {
	const { duration } = info;
	const song = list
		.slice(0, 5) // 挑前5个结果
		.find(
			(song) =>
				song.duration && Math.abs(song.duration - duration) < 5 * 1e3
		); // 第一个时长相差5s (5000ms) 之内的结果
	if (song) return song;
	else return list[0]; // 没有就播放第一条
};

module.exports.ENABLE_FLAC =
	(process.env.ENABLE_FLAC || '').toLowerCase() === 'true';
