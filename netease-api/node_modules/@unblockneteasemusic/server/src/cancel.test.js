const { CancelRequest, ON_CANCEL } = require('./cancel');

describe('CancelRequest', () => {
	test("check if CancelRequest will emit 'cancel' event after .cancel() called", (done) => {
		const cancelRequest = new CancelRequest();

		cancelRequest.on(ON_CANCEL, () => {
			done();
		});

		cancelRequest.cancel();
	}, 100);

	test('check if CancelRequest.cancelled == true after .cancel() called', () => {
		const cancelRequest = new CancelRequest();

		cancelRequest.cancel();
		expect(cancelRequest.cancelled).toBe(true);
	}, 100);
});
