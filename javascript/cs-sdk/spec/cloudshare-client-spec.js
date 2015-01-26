var Promise = require('es6-promise').Promise;
var CloudShareClient = require('../src/cloudshare-client');

describe("CloudShareClient", function() {

	var mockAuthenticationParameterProvider;
	var mockHttp;
	var requestPromise;

	beforeEach(function() {
		mockAuthenticationParameterProvider = jasmine.createSpyObj('mockAuthenticationParameterProvider', ['get']);
		mockHttp = jasmine.createSpyObj('mockHttp', ['req']);
		requestPromise = new Promise(function(resolve){resolve();});
		
		mockHttp.req.and.callFake(function() {
			return requestPromise;
		});
		mockAuthenticationParameterProvider.get.and.returnValue('AUTH-PARAM');
	});

	describe("req()", function() {
		it("return rejected promise if no hostname is given with an error", function(done) {
			var client = createClient();

			client.req({
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing hostname');
				done();
			});
		});

		it("return rejected promise if no http method is given with an error", function(done) {
			var client = createClient();
			client.req({
				hostname: 'localhost',
				apiId: 'API_ID',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing HTTP method');
				done();
			});
		});

		it("return rejected promise if no path is given with an error", function(done) {
			var client = createClient();
			
			client.req({
				hostname: 'localhost',
				method: 'GET',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err.message).toBe('Missing path');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: 'somepath'", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with https://localhost/api/v3/somepath?id=123&foo=bar as url if given hostname: 'localhost' and path: 'somepath' and queryParams: {id:123,foo:\"bar\"}", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				queryParams: {id:123, foo:"bar"}
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath?id=123&foo=bar'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with given apiId", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					apiId: 'API_ID'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls AuthenticationParameterProvider.get() with given apiKey", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).toHaveBeenCalledWith(jasmine.objectContaining({
					apiKey: 'API_KEY'
				}));
				done();
			})
			.catch(function(err) {
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("doesn't call AuthenticationParameterProvider.get() if no apiId is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).not.toHaveBeenCalled();
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("doesn't call AuthenticationParameterProvider.get() if no apiKey is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID'
			})
			.then(function() {
				expect(mockAuthenticationParameterProvider.get).not.toHaveBeenCalled();
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given HTTP method", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: 'somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					method: 'GET'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: '/somepath'", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with https://localhost/api/v3/somepath as url if given hostname: 'localhost' and path: '/somepath' and queryParams: {id: 123}", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				queryParams: {id: 123},
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					url: 'https://localhost/api/v3/somepath'
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Authorization': 'cs_sha1 AUTH-PARAM', 'Content-Type': 'application/json', 'Accept': 'application/json' }", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Authorization': 'cs_sha1 AUTH-PARAM',
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } if no apiId is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiKey: 'API_KEY'
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } if no apiKey is given", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID'
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given queryParams", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				queryParams: {
					a: '1',
					b: '2'
				}
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					queryParams: {
						a: '1',
						b: '2'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("calls Http.req() with given content", function(done) {
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
				content: {
					a: '1',
					b: '2'
				}
			})
			.then(function() {
				expect(mockHttp.req).toHaveBeenCalledWith(jasmine.objectContaining({
					content: {
						a: '1',
						b: '2'
					}
				}));
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});


		it("returns a http.req()'s resolved promise if all input is valid", function(done) {
			requestPromise = new Promise(function(resolve, reject) {
				resolve('RESPONSE');
			});
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function(response) {
				expect(response).toBe('RESPONSE');
				done();
			})
			.catch(function(err) {
				console.log(err.stack);
				expect('the promise').toBe('resolved');
				done();
			});
		});

		it("returns a http.req()'s rejected promise if all input is valid", function(done) {
			requestPromise = new Promise(function(resolve, reject) {
				reject('RESPONSE');
			});
			var client = createClient();
			
			client.req({
				method: 'GET',
				hostname: 'localhost',
				path: '/somepath',
				apiId: 'API_ID',
				apiKey: 'API_KEY',
			})
			.then(function(response) {
				expect('the promise').toBe('rejected');
				done();
			})
			.catch(function(err) {
				expect(err).toBe('RESPONSE');
				done();
			});
		});
	});


	function createClient() {
		return new CloudShareClient(mockHttp, mockAuthenticationParameterProvider);
	}

});