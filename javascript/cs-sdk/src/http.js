var Promise = require('es6-promise').Promise;

function Http() {

}

/*
	options = {
		method
		url
		headers [object]
		queryParams [object]
		content [object|string]
	}
*/
Http.prototype.req = function(options) {
	return new Promise(function(resolve, reject) {
		if (!options.method)
			throw new Error('HTTP method missing');
		else if (!options.url)
			throw new Error('URL is missing');		
		var xhr = new XMLHttpRequest();
		xhr.open(options.method, createUrl(options.url, options.queryParams));
		setHeaders(xhr, options.headers);
		xhr.onreadystatechange = function() {
			onReadyStateChange(xhr, resolve, reject);
		};
		send(xhr, options.content);
	});
}

function createUrl(url, queryParams) {
	if (typeof queryParams === 'object')
		return url + '?' + createQueryParams(queryParams);
	else
		return url;
}

function send(xhr, content) {
	if (typeof content === 'object')
		xhr.send(JSON.stringify(content));
	else if (typeof content === 'string')
		xhr.send(content);
	else
		xhr.send();
}

function onReadyStateChange(xhr, resolve, reject) {
	if (xhr.readyState !== 4)
		return;
	var content = parseResponseText(xhr);
	if (xhr.status >= 200 && xhr.status < 300) 
		resolve({content: content, status: xhr.status});
	else
		reject({content: content, status: xhr.status});
}

function parseResponseText(xhr) {
	if (isResponseJson(xhr))
		return JSON.parse(xhr.responseText);
	else
		return xhr.responseText;
}

function isResponseJson(xhr) {
	var contentType = xhr.getResponseHeader('Content-Type');
	return contentType && 
		   (contentType.indexOf('application/json') === 0 || contentType.indexOf('text/json') === 0);
}

function setHeaders(xhr, headers) {
	if (!headers)
		return;
	var headerNames = Object.keys(headers);
	for (var i = 0; i < headerNames.length; ++i) {
		var headerName = headerNames[i];
		xhr.setRequestHeader(headerName, headers[headerName]);
	}
}

function createQueryParams(obj) {
	var str = [];
	for(var p in obj){
	   if (obj.hasOwnProperty(p)) {
	       str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	   }
	}
	return str.join("&");
}

function createDeferred() {
	var resolve, reject;
	var promise = new Promise(function(_resolve, _reject) {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise: promise,
		reject: reject,
		resolve: resolve
	};
}

module.exports = Http;