module.exports = [
	'You are in the development mode of UnblockNeteaseMusic.',
	'If you are a normal user, it is better to disable DEVELOPMENT mode by',
	'\x1b[1m    DEVELOPMENT=false node app.js <your args>\x1b[0m',
	'If you are a power user or a developer, when you encountered the ',
	'\x1b[1m     Error: Cannot find module"',
	'issues, please install the dependencies with \x1b[1myarn\x1b[0m first.',
]
	.map((source) => `\x1b[1m\x1b[33mWARNING: \x1b[0m${source}`)
	.join('\n');
