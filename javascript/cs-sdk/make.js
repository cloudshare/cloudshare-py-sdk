require('shelljs/make');
var format = require('util').format;
var Promise = require('es6-promise').Promise;
var glob = require('glob');

var entry = "src/index.js";
var specs = "spec/*.js";
var dist = "dist/cssdk.js";
var distMinified = "dist/cssdk.min.js";
var specDist = "dist/cssdk-spec.js";
var standalone = "cssdk";

target['server'] = function() {
	if (!which('http-server'))
		throw new Error('please npm install -g http-server');
	execCmd("http-server . -p 8081");
};

target['karma'] = function() {
	if (!which('karma'))
		throw new Error('please npm install -g karma karma-cli');
	execCmd("karma start karma.conf.js");
};

target['karma-single'] = function() {
	if (!which('karma'))
		throw new Error('please npm install -g karma karma-cli');
	execCmd("karma start karma.conf.js --single-run");
};

target['watch'] = function() {
	if (!which('webpack'))
		throw new Error('please npm install -g webpack');
	webpackWatch(entry, dist, standalone);
};

target['bundle'] = function() {
	if (!which('webpack'))
		throw new Error('please npm install -g webpack');
	webpack(entry, dist, standalone)
	.then(function() {
		preambleFileWithLicenseComment(dist);	
	});
};

target['bundle-min'] = function() {
	if (!which('webpack'))
		throw new Error('please npm install -g webpack');
	webpackMinimize(entry, distMinified, standalone)
	.then(function() {
		preambleFileWithLicenseComment(distMinified);
	});
};

target['watchspec'] = function() {
	if (!which('webpack'))
		throw new Error('please npm install -g webpack');
	webpackWatch(glob.sync(specs), specDist, standalone);
};

target['bundlespec'] = function() {
	if (!which('webpack'))
		throw new Error('please npm install -g webpack');
	webpack(glob.sync(specs), specDist, standalone);
};

function webpack(entry, bundleName, name) {
	return execCmd(getWebpackArguments(entry, bundleName, name));
}

function webpackWatch(entry, bundleName, name) {
	return execCmd(getWebpackWatchArguments(entry, bundleName, name));
}

function webpackMinimize(entry, bundleName, name) {
	return execCmd(getWebpackMinimizeArguments(entry, bundleName));
}

function getWebpackWatchArguments(entry, bundleName, name) {
	return getWebpackArguments(entry, bundleName, name) + " --watch";
}

function getWebpackMinimizeArguments(entry, bundleName, name) {
	return getWebpackArguments(entry, bundleName, name).replace("--devtool inline-source-map", "") + " --optimize-minimize";
}

function getWebpackArguments(entry, bundleName, name) {
	return format('webpack %s %s --output-library "%s" --output-library-target umd --devtool inline-source-map', joinEntriesIfArray(entry), bundleName, name)
}

function joinEntriesIfArray(entryOrEntries) {
	return entryOrEntries instanceof Array ? entryOrEntries.join(" ") : entryOrEntries
}

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

function preambleFileWithLicenseComment(file) {
	console.log('adding license comment to ' + file);
	var licenseComment = "/*\n" + cat("./LICENSE.txt") + "\n*/\n";
	var oldFileContents = cat(file);
	licenseComment.to(file);
	oldFileContents.toEnd(file);
}
