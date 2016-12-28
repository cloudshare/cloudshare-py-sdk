CloudShare API v3 SDK
=====================
Quickstart
----------
`pip install cloudshare`


Then just `import cssdk` and use the function `cssdk.req()` described below.


Interface
---------
This library is written for python 2.7.

```
def req(hostname, method, apiId, apiKey, path="", queryParams=None, content=None)
```
Required parameters are the `hostname`, `method`, `apiId` and `apiKey`.

`hostname` is usually `use.cloudshare.com` unless your using some mock or proxy.

`method` is one of "GET", "POST", "PUT", "DELETE", depends on the context of the call.

`apiId` and `apiKey` are valid CloudShare credentials.

`path` is what comes after the `'/api/v3'` part of the request url (e.g `'envs'`, `'vms/actions/executePath'`)

`queryParams` are a dict of values that translate to a query string and concatenated to the request url

`content` is a dict that's encoded to JSON and sent in the body section of the request, in POST and PUT requests.

Examples
--------
#### example.py
Enter your credentials in the two global variables `API_ID` and `API_KEY` and run it with `python example.py`. The script tries to run the command `echo hello world` on the first machine on the first environment it finds (visible to the user's credentials). 

#### List your environments
```
import cssdk
res = cssdk.req(hostname='use.cloudshare.com',
				method='GET',
				path='envs',
				apiId='Your API ID',
				apiKey='You API Key')
if (res.status / 100 != 2):
	raise Exception(res)
print 'hi! these are my environments:'
print [e['name'] for e in res.content]
```

#### Get one environment
```
import cssdk
res = cssdk.req(hostname='use.cloudshare.com',
				method='GET',
				path='envs/' + envId,
				apiId='Your API ID',
				apiKey='You API Key')
if (res.status / 100 != 2):
	raise Exception(res)
print 'look at my environment details:'
print res.content
```

#### Suspend an environment
```
import cssdk
res = cssdk.req(hostname='use.cloudshare.com',
				method='PUT',
				path='envs/actions/suspend',
				queryParams={'envId': envId},
				apiId='Your API ID',
				apiKey='Your API Key')
if (res.status / 100 != 2):
	raise Exception(res.content)
print res.content
```

## Building from source

```
make setup
make build test
```
