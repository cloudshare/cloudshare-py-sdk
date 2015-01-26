var Bottle = require('bottlejs');
var bottle = new Bottle();

bottle.service('HMACService', require('./hmac-service'));
bottle.service('Http', require('./http'));
bottle.service('AuthenticationParameterProvider', require('./authentication-parameter-provider'), 'HMACService');
bottle.service('CloudShareClient', require('./cloudshare-client'), 'Http', 'AuthenticationParameterProvider');

module.exports = bottle;