require('shelljs/make');
var format = require('util').format;
var Promise = require('es6-promise').Promise;

var entry = "src/index.js";
var specs = "spec/*.js";
var dist = "dist/cssdk.js";
var distMinified = "dist/cssdk.min.js";
var specDist = "dist/cssdk-spec.js";
var standalone = "cssdk";
var browserifyCmd = "./node_modules/.bin/browserify";
var watchifyCmd = "./node_modules/.bin/watchify";
var karmaCmd = "./node_modules/karma/bin/karma";
var uglifyCmd = "./node_modules/.bin/uglifyjs";

target.server = function() {
	if (!which('http-server'))
		throw new Error('http-server is required');
	execCmd("http-server . -p 8081");
};

target.karma = function() {
	if (!test('-f', karmaCmd))
		throw new Error('local karma is required');
	execCmd("node " + karmaCmd + " start karma.conf.js");
};

target['karma-single'] = function() {
	if (!test('-f', karmaCmd))
		throw new Error('local karma is required');
	execCmd("node " + karmaCmd + " start karma.conf.js --single-run");
};

target.watch = function() {
	if (!test('-f', watchifyCmd))
		throw new Error('local watchify is required');
	execCmd(watchifyCmd + getBundleArgs() + " -v");
};

target.bundle = function() {
	if (!test('-f', browserifyCmd))
		throw new Error('local browserify is required');
	execCmd(browserifyCmd + getBundleArgs())
	.then(function() {
		preambleFileWithLicenseComment(dist);	
	});
};

target['bundle-min'] = function() {
	if (!test('-f', browserifyCmd))
		throw new Error('local browserify is required');
	execCmd(browserifyCmd + getBundleArgsForPipe() + " | " + uglifyCmd + " > " + distMinified)
	.then(function() {
		preambleFileWithLicenseComment(distMinified);
	});
};

target.watchspec = function() {
	if (!test('-f', watchifyCmd))
		throw new Error('local watchify is required');
	execCmd(watchifyCmd + getBundleSpecArgs() + " -v");
};

target.bundlespec = function() {
	if (!test('-f', browserifyCmd))
		throw new Error('local browserify is required');
	execCmd(browserifyCmd + getBundleSpecArgs());
};

function execCmd(cmd) {
	return new Promise(function(resolve) {
		cmd = fixPath(cmd);
		console.log('executing:', cmd);
		var child = exec(cmd, {async: true});
		child.on('exit', function() {
			resolve();
		});
	});
}

function fixPath(path) {
	return path.replace(/[\/\\]/g, require('path').sep);
}

function getBundleArgsForPipe() {
	return format(" %s -d -s %s ", entry, standalone);
}

function getBundleArgs() {
	return format(" %s -o %s -d -s %s", entry, dist, standalone);
}

function getBundleSpecArgs() {
	var sp = require('glob').sync(specs).join(" ");
	return format(" %s -o %s -d", sp, specDist);	
}

function preambleFileWithLicenseComment(file) {
	console.log('adding license comment to ' + file);
	var licenseComment = "/*\n" + cat("./LICENSE.txt") + "\n*/\n";
	var oldFileContents = cat(file);
	licenseComment.to(file);
	oldFileContents.toEnd(file);
}
