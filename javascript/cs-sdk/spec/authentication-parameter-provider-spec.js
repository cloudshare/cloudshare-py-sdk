var AuthenticationParameterProvider = require('../src/authentication-parameter-provider');

describe("AuthenticationParameterProvider", function() {

	var mockHMACService;

	beforeEach(function() {
		mockHMACService = jasmine.createSpyObj('mockHMACService', ['hash']);
		mockHMACService.hash.and.callFake(function(obj) {
			return "HASHED-VALUE";
		});
	});

	describe("get()", function() {
		it("returns the the auth param in the correct format", function() {
			var authenticationParameterProvider = createProvider();

			var result = authenticationParameterProvider.get({
				url: 'https://localhost/api/v3/BoobySchmooby',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			});

			expect(result).toMatch(/^userapiid:API_ID;timestamp:\d+;token:\w{10};hmac:HASHED-VALUE$/);
		});

		it("calls HMACService.hash() with the given apiKey, url, timestamp, and token", function() {
			var authenticationParameterProvider = createProvider();

			authenticationParameterProvider.get({
				url: 'https://localhost/api/v3/BoobySchmooby',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			});

			var params = mockHMACService.hash.calls.first().args[0];
			expect(params.apiKey).toEqual('API_KEY');
			expect(params.url).toEqual('https://localhost/api/v3/BoobySchmooby');
			expect(params.token).toMatch(/\w{10}/);
			expect(params.timestamp).toMatch(/\d+/);
		});
	});


	function createProvider() {
		return new AuthenticationParameterProvider(mockHMACService);
	}

});