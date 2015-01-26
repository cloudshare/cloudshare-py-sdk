CloudShare API v3 SDK
=====================
Quickstart
----------
Open the solution file cssdk.sln and build the solution, or just the cssdk project. And reference the cssdk.dll in your project.

It was built using visual studio 2012 and .NET 4.5. The testing project cssdk.test has a single dependency managed by nuget.

Interface
---------
The `CloudShareSdk` has one method `GetClient()` that returns an `ICloudShareClient` object:
```
public interface ICloudShareClient
{
    Task<Response> ReqAsync(Request request);
}
public struct Request
{
    public string Hostname { get; set; }
    public HttpMethodEnum Method { get; set; }
    public string Path { get; set; }
    public object QueryParams { get; set; }
    public object Body { get; set; }
    public string ApiId { get; set; }
    public string ApiKey { get; set; }
}

public struct Response
{
    public int Status { get; set; }
    public dynamic Content { get; set; }
}
```

`Request.Hostname`, `Request.Method`, `Request.ApiId` and `Request.ApiKey` are required. In order to call something useful `Request.Path` needs to be filled (e.g. `Path="envs"`, see examples below). `Request.QueryParams` and `Request.Body` are anonymous objects, `Body` is parsed into JSON before the request is sent, and `QueryParams` is parsed into a query string and appended to the final URL.

`Response.Status` holds the HTTP status code, if it's not in the 200's range an error was returned, if a 204 is returned `Response.Content` is null. Otherwise `Response.Content` is a IDictionary<string,object> or a IList<object>, see examples below.

Examples
--------
#### Driver program
The driver project is a Windows console program demonstrating a simple workflow to execute a command on one of the user's environments. Before running you should change the API_ID and API_KEY variables to your credentials.

#### List your environments
```
[TestMethod]
public void TestMethod()
{
    var client = CloudShareSdk.GetClient();
    var response = client.ReqAsync(new Request
    {
        Hostname = "use.cloudshare.com",
        Method = HttpMethodEnum.GET,
        Path = "envs",
        QueryParams = null,
        Body = null,
        ApiId = "5VLLDABQSBESQSKY",
        ApiKey = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo",
    }).Result;
    if (response.Status >= 300 || response.Status < 200)
        throw new Exception(response.Content != null ? response.Content["message"] : null);
    var envs = response.Content;
    foreach (var env in envs)
        Debug.WriteLine("{0}: {1}", (string)env["id"], (string)env["name"]);
}
```

#### Get one environment
```
[TestMethod]
public void TestMethod()
{
    var client = CloudShareSdk.GetClient();
    var response = client.ReqAsync(new Request
    {
        Hostname = "use.cloudshare.com",
        Method = HttpMethodEnum.GET,
        Path = "envs/" + envId,
        QueryParams = null,
        Body = null,
        ApiId = "5VLLDABQSBESQSKY",
        ApiKey = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo",
    }).Result;
    if (response.Status >= 300 || response.Status < 200)
        throw new Exception(response.Content != null ? response.Content["message"] : null);
    var env = response.Content;
    foreach (var kv in (IDictionary<string, Object>)env)
        Debug.WriteLine("{0}: {1}", kv.Key, kv.Value);
}
```

#### Suspend an environment
```
[TestMethod]
public void TestMethod()
{
    var client = CloudShareSdk.GetClient();
    var response = client.ReqAsync(new Request
    {
        Hostname = "use.cloudshare.com",
        Method = HttpMethodEnum.PUT,
        Path = "envs/actions/suspend",
        QueryParams = new
            {
                envId = envId
            },
        Body = null,
        ApiId = "5VLLDABQSBESQSKY",
        ApiKey = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo",
    }).Result;
    if (response.Status >= 300 || response.Status < 200)
        throw new Exception(response.Content != null ? response.Content["message"] : null);
    Assert.AreEqual(204, response.Status);
    Assert.IsNull(response.Content);
}
```