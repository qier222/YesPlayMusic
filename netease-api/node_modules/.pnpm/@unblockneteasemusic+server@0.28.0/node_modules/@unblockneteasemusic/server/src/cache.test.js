const {
	CacheStorage,
	CacheStorageEvents,
	CacheStorageGroup,
} = require('./cache');

describe('CacheStorage', () => {
	describe('CacheStorage#constructor', () => {
		it('constructor() without the parameter "id" should work properly', () => {
			const cs = new CacheStorage();
			expect(cs.id).toBe('Default Cache Storage');
		});

		it('constructor() with the parameter "id" should work properly', () => {
			const cs = new CacheStorage('JestTest');
			expect(cs.id).toBe('JestTest');
		});
	});

	describe('CacheStorage#removeExpiredCache', () => {
		it('removeExpiredCache() can remove the expired entries in the CacheStorage', () => {
			const cs = new CacheStorage();
			cs.cacheMap.set('JestExpireTest', {
				data: 'hi',
				expireAt: Date.now() - 100000,
			});

			cs.removeExpiredCache();
			expect(cs.cacheMap.size).toBe(0);
			expect(cs.cacheMap.get('JestExpireTest')).not.toBeDefined();
		});

		it('removeExpiredCache() will not remove the alive entries in the CacheStorage', () => {
			const cs = new CacheStorage();
			const aliveTestObject = {
				data: 'hi2',
				expireAt: Date.now() + 10e10,
			};

			cs.cacheMap.set('JestExpireTest', {
				data: 'hi',
				expireAt: Date.now() - 100000,
			});
			cs.cacheMap.set('JestAliveTest', aliveTestObject);

			cs.removeExpiredCache();
			expect(cs.cacheMap.size).toBe(1);
			expect(cs.cacheMap.get('JestExpireTest')).not.toBeDefined();
			expect(cs.cacheMap.get('JestAliveTest')).toStrictEqual(
				aliveTestObject
			);
		});

		it('removeExpiredCache() can be called with CLEANUP (cs@cleanup) event.', (done) => {
			const cs = new CacheStorage();

			cs.on(CacheStorageEvents.CLEANUP, () => {
				expect(cs.removeExpiredCache).toHaveBeenCalledTimes(1);
				done();
			});
			cs.removeExpiredCache = jest.fn();

			cs.emit(CacheStorageEvents.CLEANUP);
		});
	});

	describe('CacheStorage#cache', () => {
		it('cache() can correctly place the cache', async () => {
			const cs = new CacheStorage();
			const mockFunc = jest
				.fn()
				.mockReturnValue(Promise.resolve().then(() => '12345'));

			await cs.cache('owo', mockFunc);

			expect(mockFunc).toHaveBeenCalledTimes(1);
			expect(cs.cacheMap.size).toBe(1);
			expect(cs.cacheMap.get('owo')).toBeDefined();
			expect(cs.cacheMap.get('owo').data).toBe('12345');
		});

		it('cache() can correctly reuse the cache', async () => {
			const cs = new CacheStorage();
			const mockFunc = jest
				.fn()
				.mockReturnValue(Promise.resolve().then(() => '12345'));

			for (let i = 0; i < 5; i++) await cs.cache('owo', mockFunc);

			expect(mockFunc).toHaveBeenCalledTimes(1);
			expect(cs.cacheMap.size).toBe(1);
			expect(cs.cacheMap.get('owo')).toBeDefined();
			expect(cs.cacheMap.get('owo').data).toBe('12345');
		});

		it('cache() (once) should return the execution result', async () => {
			const cs = new CacheStorage();
			const mockFunc = () => Promise.resolve().then(() => '12345');

			expect(await cs.cache('owo', mockFunc)).toBe('12345');
		});

		it('cache() (twice) should return the execution result', async () => {
			const cs = new CacheStorage();
			const mockFunc = () => Promise.resolve().then(() => '12345');

			await cs.cache('owo', mockFunc);

			expect(await cs.cache('owo', mockFunc)).toBe('12345');
		});

		it('cache() can trigger removeExpiredCache()', (done) => {
			const cs = new CacheStorage();
			const mockFunc = jest
				.fn()
				.mockReturnValue(Promise.resolve().then(() => '12345'));

			cs.on(CacheStorageEvents.CLEANUP, () => {
				expect(cs.removeExpiredCache).toHaveBeenCalledTimes(1);
				done();
			});
			cs.removeExpiredCache = jest.fn();

			cs.cache('owo', mockFunc);
		});
	});
});

describe('CacheStorageGroup', () => {
	const instance = CacheStorageGroup.getInstance();

	beforeEach(() => {
		// Reset the cacheStorages in CacheStorageGroup for every test.
		instance.cacheStorages.clear();
	});

	describe('CacheStorageGroup#getInstance', () => {
		it('CacheStorageGroup should be singleton', () => {
			expect(CacheStorageGroup.getInstance()).toStrictEqual(instance);
		});
	});

	describe('CacheStorageGroup#cleanup', () => {
		it('CacheStorageGroup#cleanup should call the removeExpiredCache() in every storages registered', () => {
			const cs = new CacheStorage('JestCSGTest');
			cs.removeExpiredCache = jest.fn();

			instance.cacheStorages.add(cs);
			instance.cleanup();

			expect(cs.removeExpiredCache).toHaveBeenCalledTimes(1);
		});
	});
});
