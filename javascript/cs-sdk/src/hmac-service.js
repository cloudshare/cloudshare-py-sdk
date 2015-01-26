var jssha = require('jssha');

function HMACService() {
	this.jssha = jssha;
}

HMACService.prototype.hash = function(params) {
	var text = params.apiKey + params.url + params.timestamp + params.token;
	return new this.jssha(text, 'TEXT').getHash('SHA-1', 'HEX');
}

module.exports = HMACService;