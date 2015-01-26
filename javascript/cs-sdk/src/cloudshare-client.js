var Promise = require('es6-promise').Promise;

function CloudShareClient(http, authenticationParameterProvider) {
	this.http = http;
	this.authParamProvider = authenticationParameterProvider;
}

/*
	options = {
		[hostname],
		method,
		path,
		[queryParams],
		[content],
		[apiId],
		[apiKey]
	}
*/
CloudShareClient.prototype.req = function(options) {
	var self = this;
	return new Promise(function(resolve, reject) {
		options = validateAndMassageOptions(options, reject);
		resolve(request(self, options));
	});
};

function request(self, options) {
	return self.http.req({
		method: options.method,
		url: generateUrlWithoutQueryString(options),
		headers: getHeaders(self, options),
		queryParams: options.queryParams,
		content: options.content
	});
}

function getHeaders(self, options) {
	var headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	};
	if (options.apiId && options.apiKey)
		headers['Authorization'] = 'cs_sha1 ' + getAuthParam(self, options);
	return headers;
}

function getAuthParam(self, options) {
	return self.authParamProvider.get({
		url: generateUrlWithQueryString(options),
		apiId: options.apiId,
		apiKey: options.apiKey
	});	
}

function validateAndMassageOptions(options, reject) {
	options = options || {};
	validateOptions(options, reject);
	prefixPathWithSlash(options);
	return options;
}

function prefixPathWithSlash(options) {
	if (options.path.indexOf('/') !== 0)
		options.path = '/' + options.path;
}

function validateOptions(options, reject) {
	if (!options.hostname)
		throw new Error("Missing hostname");
	else if (!options.method)
		throw new Error("Missing HTTP method");
	else if (!options.path)
		throw new Error("Missing path");
}

function generateUrlWithQueryString(options) {
	return generateUrlWithoutQueryString(options) + createQueryParams(options.queryParams);
}

function generateUrlWithoutQueryString(options) {
	return 'https://' + options.hostname + '/api/v3' + options.path;
}

function createQueryParams(obj) {
	if (!obj)
		return "";
	var str = [];
	for (var p in obj) {
	   if (obj.hasOwnProperty(p))
	       str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	}
	return str.length > 0 ? "?" + str.join("&") : "";
}

function tryJSONParse(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		return text;
	}
}

module.exports = CloudShareClient;

