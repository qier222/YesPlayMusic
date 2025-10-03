/**
 * A very simple dotenv implementation.
 */

//@ts-check

const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * Parse .env file.
 *
 * @param {string} filePath
 * @returns {Promise<Record<string, string>>}
 */
async function parseDotenv(filePath) {
	const env = /**@type {Record<string, string>}*/ ({});
	const rl = readline.createInterface({
		input: fs.createReadStream(filePath),
		crlfDelay: Infinity,
	});

	for await (const line of rl) {
		if (line.startsWith('#')) continue;

		const [key, value] = line.split(/=(.+)/, 2);
		env[key.trimEnd()] = value.trimStart();
	}

	return env;
}

/**
 * Find .env file.
 *
 * @returns {Promise<string|null>}
 */
async function findEnv() {
	const cwd = process.cwd();
	const envPath = path.join(cwd, '.env');

	try {
		await fs.promises.access(envPath, fs.constants.R_OK);
		return envPath;
	} catch (err) {
		return null;
	}
}

/**
 * Inject environment variables into process.env.
 *
 * @param {Record<string, string>} env
 * @returns {void}
 */
function injectEnv(env) {
	// https://github.com/motdotla/dotenv/blob/aa03dcad1002027390dac1e8d96ac236274de354/lib/main.js#L277
	for (const [key, value] of Object.entries(env)) {
		// the priority of .env is lower than process.env
		// due to Node.js 12, we don't use nullish coalescing operator
		process.env[key] = process.env[key] == null ? value : process.env[key];
	}

	return;
}

/**
 * A simple method for finding .env file and injecting
 * environment variables into process.env.
 *
 * No exceptions will be raised – we have handled errors
 * inside this code.
 *
 * @returns {Promise<void>}
 */
async function loadDotenv() {
	const envPath = await findEnv();
	if (envPath == null) {
		return;
	}

	try {
		const env = await parseDotenv(envPath);
		injectEnv(env);
	} catch (e) {
		console.error(e);
	}

	return;
}

module.exports = {
	loadDotenv,
	injectEnv,
	findEnv,
	parseDotenv,
};
