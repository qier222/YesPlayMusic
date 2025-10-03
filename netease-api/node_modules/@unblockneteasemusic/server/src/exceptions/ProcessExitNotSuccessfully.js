class ProcessExitNotSuccessfully extends Error {
	constructor(process, exitCode) {
		super(`${process} exited with ${exitCode}, which is not zero.`);
		this.process = process;
		this.exitCode = exitCode;
		this.name = 'ProcessExitNotSuccessfully';
	}
}

module.exports = ProcessExitNotSuccessfully;
