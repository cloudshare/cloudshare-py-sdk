/*
Copyright 2015 CloudShare Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;

namespace cssdk
{
    public interface ICloudShareClient
    {
        Task<Response> ReqAsync(Request request);
        Task<ResponseT<T>> ReqAsync<T>(Request request);
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

    public struct ResponseT<T>
    {
        public int Status { get; set; }
        public T Content { get; set; }
    }

    public class HostnameMissingException : Exception {}
    public class ApiIdMissingException : Exception { }
    public class ApiKeyMissingException : Exception { }

    public class CloudShareClient : ICloudShareClient
    {
        private IHttp Http { get; set; }
        private IAuthenticationParameterProvider AuthenticationParameterProvider { get; set; }

        public CloudShareClient(IHttp http, IAuthenticationParameterProvider authenticationParameterProvider)
        {
            Http = http;
            AuthenticationParameterProvider = authenticationParameterProvider;
        }

        public async Task<ResponseT<T>> ReqAsync<T>(Request request)
        {
            var response = await GetHttpResponse(request);
            return new ResponseT<T>
            {
                Content = response.Content != null ? new JavaScriptSerializer().Deserialize<T>(response.Content) : default(T),
                Status = response.Status
            };
        }

        public async Task<Response> ReqAsync(Request request)
        {
            var response = await GetHttpResponse(request);
            return new Response
                {
                    Content = response.Content != null ? new JavaScriptSerializer().DeserializeObject(response.Content) : null,
                    Status = response.Status
                };
        }

        private async Task<HttpResponse> GetHttpResponse(Request request)
        {
            if (request.Hostname == null)
                throw new HostnameMissingException();
            if (request.ApiId == null)
                throw new ApiIdMissingException();
            if (request.ApiKey == null)
                throw new ApiKeyMissingException();
            var r = new HttpRequest
                {
                    Body = request.Body != null ? new JavaScriptSerializer().Serialize(request.Body) : "",
                    Headers = GetHeaders(request),
                    Hostname = request.Hostname,
                    Method = request.Method,
                    Path = GeneratePathAndQueryString(request)
                };
            var response = await Http.ReqAsync(r);
            return response;
        }

        private IDictionary<string, string> GetHeaders(Request request)
        {
            return new Dictionary<string, string>
                {
                    {"Accept", "application/json"},
                    {"Authorization", "cs_sha1 " + GetAuthenticationParam(request)}
                };
        }

        private string GetAuthenticationParam(Request request)
        {
            return AuthenticationParameterProvider.Get(new AuthenticationParameters
                {
                    ApiId = request.ApiId,
                    ApiKey = request.ApiKey,
                    Url = GenerateUrl(request)
                });
        }

        private string GenerateUrl(Request request)
        {
            return "https://" + request.Hostname + GeneratePathAndQueryString(request);
        }

        private string GeneratePathAndQueryString(Request request)
        {
            return PrependSlashIfNotPresetAndApiPath(request.Path) + GenerateQueryString(request.QueryParams);
        }

        private string GenerateQueryString(object queryParams)
        {
            var d = ObjectToDictionary(queryParams);
            var q = String.Join("&", ObjectToDictionary(queryParams).Select(kv => HttpUtility.UrlPathEncode(kv.Key) + "=" + HttpUtility.UrlPathEncode(kv.Value)));
            return q.Length > 0 ? "?" + q : "";
        }

        private IEnumerable<KeyValuePair<string, string>> ObjectToDictionary(object obj)
        {
            if (obj == null)
                return new Dictionary<string, string>();
            return obj.GetType().GetProperties().ToDictionary(f => f.Name, f => f.GetValue(obj).ToString());
        }
        private string PrependSlashIfNotPresetAndApiPath(string path)
        {
            if (path == null)
                return "/api/v3";
            var normalPath = "/" + string.Join("/", path.Trim().Trim('/').Split('/'));
            if (normalPath.StartsWith("/api/v3"))
                return normalPath;
            return "/api/v3" + normalPath;
        }
    }
}
