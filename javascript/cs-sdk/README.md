CloudShare API v3 SDK
=====================
Quickstart
----------
### Use the prebuilt javascripts
The all-in-one javascript bundles are already built and ready to use in `dist/` directory. Just include one of `cssdk.js` or `cssdk.min.js` in your html page. A `cssdk` global object is exposed that contain one method `req()`.

### Build it yourself
1. Install node version 4
2. `cd cs-sdk`
3. run `npm install`
4. Use the make-like command `npm run` to run the package's tasks: (this assumes you're running a windows machine, see step 5 if not)
    1. `npm run bundle` to build the unminified `dist/cssdk.js` (with built-in source-map).
    2. `set dev=true && npm run bundle` to build the minified `dist/cssdk.min.js`.
    3. `npm test` to run the unit tests.  
5. If you're running a unixy machine
    1. In `package.json` under the `scripts` section convert the use of batch-style variable to unix like (`%VAR%` => `$VAR`) before running `npm run`
    2. To build the minified version run `dev=true && npm run bundle`

On windows machines with more than one visual studio installed, node-gyp complains sometimes. Choosing another visual studio version to use seem to help:
```
npm install --msvs_version=2012
``` 

Interface
---------
Whether included as an HTML script tag or through a CommonJS `require()`, the interface is a single object (a global object named `cssdk` in case it is included in a script tag), that has a single method `req()` that accepts an options object:
```
{
	hostname: String,
	method: String,
	path: String,
	queryParams: Object,
	content: Object,
	apiId: String,
	apiKey: String,
}
```
`hostname`, `method`, `apiId` and `apiKey` are required. And in order to request something useful the `path` property needs to be filled (e.g. `path="envs"`, see examples below). `queryParams` if not null, is parsed into a query string that's added to the URL before the request is sent, and `content` is parsed into a `JSON` string before the request is sent.

If one of the required options is null/undefined, an exception is thrown. Otherwise the return value is an object:
```
{
	content: Object | Array,
	status: Number
}
```

`status` is the HTTP response status, if not in the 200's range an error occured, if the status is 204 `content` is null. Otherwise `content` holds the actual response in form of an Object or an Array.

Example Usage
-------------
#### An example html
You can take a look at `driver/index.html` for a kind of "hello world" example. To run it do the following:

1. `npm install`
2. `node run server`
3. Make sure you set your API ID and API key in the global vars: `API_ID` and `API_KEY` in `driver/index.html`.
3. Navigate to `localhost:8080/driver/index.html` and open the browser's javascript console.

#### List your environments
```
cssdk.req({
	hostname: 'use.cloudshare.com',
	method: 'GET',
	path: 'envs',
	apiId: 'Your API ID',
	apiKey: 'Your API key'
})
.then(function(response) {
	console.log('hi! these are my environments:');
	console.log(response.content);
})
.catch(function(response) {
	if (response instanceof Error)
		console.log(response);
	else
		console.log('got status:', response.status, 
					'with content:', response.content);
});		
```

#### Get one environment
```
cssdk.req({
	hostname: 'use.cloudshare.com',
	method: 'GET',
	path: 'envs/' + envId,
	apiId: 'Your API ID',
	apiKey: 'Your API key'
})
.then(function(response) {
	console.log('Look at my environment details:');
	console.log(response.content);
})
.catch(function(response) {
	if (response instanceof Error)
		console.log(response);
	else
		console.log('got status:', response.status, 
					'with content:', response.content);
});		
```

#### Suspend an environment
```
cssdk.req({
	hostname: 'use.cloudshare.com',
	method: 'PUT',
	path: 'envs/actions/suspend',
	queryParams: {
		envId: envId
	},
	apiId: 'Your API ID',
	apiKey: 'Your API key'
})
.then(function(response) {
	console.log(response);
})
.catch(function(response) {
	if (response instanceof Error)
		console.log(response);
	else
		console.log('got status:', response.status, 
					'with content:', response.content);
});
```
