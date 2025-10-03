const { CancelRequest } = require('./cancel');
const request = require('./request');
const RequestCancelled = require('./exceptions/RequestCancelled');

describe('request()', () => {
	test('will throw RequestCancelled when the CancelRequest has been cancelled', async () => {
		const cancelRequest = new CancelRequest();
		cancelRequest.cancel();

		try {
			await request(
				'GET',
				'https://www.example.com',
				undefined,
				undefined,
				undefined,
				cancelRequest
			);
		} catch (e) {
			console.log(e);
			expect(e).toBeInstanceOf(RequestCancelled);
			return;
		}

		throw new Error('It should not be fulfilled.');
	});

	test('will NOT throw RequestCancelled when the CancelRequest has not been cancelled', async () => {
		const cancelRequest = new CancelRequest();

		return request(
			'GET',
			'https://www.example.com',
			undefined,
			undefined,
			undefined,
			cancelRequest
		);
	}, 15000);

	test('headers should be in the response', async () => {
		const response = await request('GET', 'https://www.example.com');

		expect(response.headers).toBeDefined();
	}, 15000);

	test('.body(raw: false) should returns the string', async () => {
		const response = await request('GET', 'https://www.example.com');
		const body = await response.body(false);

		expect(typeof body === 'string').toBeTruthy();
	}, 15000);

	test('.body(raw: true) should returns the Buffer', async () => {
		const response = await request('GET', 'https://www.example.com');
		const body = await response.body(true);

		expect(body).toBeInstanceOf(Buffer);
	}, 15000);

	// FIXME: re-enable after api.opensource.org becomes online
	//
	// test('.json() should returns the deserialized data', async () => {
	// 	const response = await request(
	// 		'GET',
	// 		'https://api.opensource.org/licenses/'
	// 	);
	// 	const body = await response.json();

	// 	expect(Array.isArray(body)).toBeTruthy();
	// }, 15000);

	// test('.url should be the request URL', async () => {
	// 	const response = await request(
	// 		'GET',
	// 		'https://api.opensource.org/licenses/'
	// 	);

	// 	expect(response.url).toStrictEqual(
	// 		url.parse('https://api.opensource.org/licenses/')
	// 	);
	// }, 15000);
});
