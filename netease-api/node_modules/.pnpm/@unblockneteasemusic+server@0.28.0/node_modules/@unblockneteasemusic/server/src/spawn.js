const child_process = require('child_process');
const { logScope } = require('./logger');
const ProcessExitNotSuccessfully = require('./exceptions/ProcessExitNotSuccessfully');
const logger = logScope('spawn');

/**
 * @typedef {{stdout: Buffer, stderr: Buffer}} ExecutionResult
 */

/**
 * Spawn a command and get the execution result of that.
 *
 * @param {string} cmd The command. Example: `ls`
 * @param {string[]?} args The arguments list
 * @return {Promise<ExecutionResult>} The execution result (stdout and stderr) of this execution.
 * @example ```js
 * const { stdout, stderr } = await spawnStdout("ls");
 * console.log(stdout.toString());
 * ```
 */
async function spawnStdout(cmd, args = []) {
	return new Promise((resolve, reject) => {
		let stdoutOffset = 0;
		let stderrOffset = 0;
		const stdout = Buffer.alloc(5 * 1e3 * 1e3);
		const stderr = Buffer.alloc(5 * 1e3 * 1e3);
		const spawn = child_process.spawn(cmd, args);

		spawn.on('spawn', () => {
			// Users should acknowledge what command is executing.
			logger.info(`running ${cmd} ${args.join(' ')}`);
		});

		spawn.on('error', (error) => reject(error));
		spawn.on('close', (code) => {
			if (code !== 0) reject(new ProcessExitNotSuccessfully(cmd, code));
			else {
				logger.debug(`process ${cmd} exited successfully`);
				resolve({
					stdout: stdout.slice(0, stdoutOffset),
					stderr: stderr.slice(0, stderrOffset),
				});
			}
		});

		spawn.stdout.on('data', (stdoutPart) => {
			stdoutOffset += stdoutPart.copy(stdout, stdoutOffset);
		});
		spawn.stderr.on('data', (stderrPart) => {
			logger.warn(`[${cmd}][stderr] ${stderrPart}`);
			stderrOffset += stderrPart.copy(stderr, stderrOffset);
		});
	});
}

module.exports = { spawnStdout };
