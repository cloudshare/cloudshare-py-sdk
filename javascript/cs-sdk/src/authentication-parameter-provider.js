
function AuthenticationParameterProvider(hmacService) {
	this.hmacService = hmacService;
}

/*
	options = {
		url: entire request url (https://...),
		apiId
		apiKey
	}
*/
AuthenticationParameterProvider.prototype.get = function(options) {
	var params = getParameters(options);
	var hmac = getHmac(this, params);
	return getAuthString(params, hmac);
};

function getAuthString(params, hmac) {
	return "userapiid:" + params.apiId + ";timestamp:" + params.timestamp + ";token:" + params.token + ";hmac:" + hmac;
}

function getParameters(options) {
	return {
		apiId: options.apiId,
		apiKey: options.apiKey,
		timestamp: getTimestamp(),
		token: getReenterancyToken(),
		url: options.url
	};
}

function getReenterancyToken() {
	return Math.random().toString().substring(2, 12);
}

function getTimestamp() {
	return Math.floor(Date.now() / 1000);
}

function getHmac(self, params) {
	return self.hmacService.hash({
		apiKey: params.apiKey,
		url: params.url,
		timestamp: params.timestamp,
		token: params.token
	});
}

module.exports = AuthenticationParameterProvider;
