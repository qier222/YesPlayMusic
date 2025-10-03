// @ts-check

const { loadDotenv } = require('../dotenv.js');
const devMessage = require('./message');

/**
 * Start the main part.
 *
 * @param {string} mainEntry
 * @returns {Promise<void>}
 */
async function startApp(mainEntry) {
	// Inject the `.env` file into the `process.env` object.
	await loadDotenv();

	if (process.env.DEVELOPMENT === 'true') {
		console.warn(devMessage);
		// Require the source.
		require('../' + mainEntry);
	} else {
		// Require the precompiled bundle.
		require('../../precompiled/' + mainEntry);
	}
}

module.exports = startApp;
