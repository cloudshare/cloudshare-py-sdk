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
using System.Net.Http.Headers;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace cssdk
{
    public interface IHttp
    {
        Task<HttpResponse> ReqAsync(HttpRequest request);
    }

    public struct HttpRequest
    {
        public HttpMethodEnum Method { get; set; }
        public string Hostname { get; set; }
        public string Path { get; set; }
        public IDictionary<string,string> Headers { get; set; }
        public string Body { get; set; }
    }

    public struct HttpResponse
    {
        public string Content { get; set; }
        public int Status { get; set; }
    }

    public enum HttpMethodEnum
    {
        GET,
        POST,
        PUT,
        DELETE
    }

    public class Http : IHttp
    {
        public async Task<HttpResponse> ReqAsync(HttpRequest request)
        {
            var httpClient = new HttpClient();
            httpClient.BaseAddress = GetBaseAddress(request);
            SetHeaders(httpClient, request.Headers);
            var response = await MethodAsync(httpClient, request);
            return new HttpResponse
                {
                    Content = await response.Content.ReadAsStringAsync(),
                    Status = (int) response.StatusCode
                };
        }

        private void SetHeaders(HttpClient httpClient, IDictionary<string,string> headers)
        {
            if (headers == null)
                return;
            foreach (var k in headers)
                if (k.Value != null)
                    httpClient.DefaultRequestHeaders.Add(k.Key, k.Value);
                
        }

        private async Task<HttpResponseMessage> MethodAsync(HttpClient httpClient, HttpRequest request)
        {
            switch (request.Method)
            {
                case HttpMethodEnum.GET:
                    return await httpClient.GetAsync(request.Path);
                case HttpMethodEnum.POST:
                    return await httpClient.PostAsync(request.Path, CreateHttpContent(request));
                case HttpMethodEnum.PUT:
                    return await httpClient.PutAsync(request.Path, CreateHttpContent(request));
                case HttpMethodEnum.DELETE:
                    return await httpClient.DeleteAsync(request.Path);
                default:
                    return null;
            }
        }

        private HttpContent CreateHttpContent(HttpRequest request)
        {
            var content = new StringContent(request.Body);
            content.Headers.ContentType.MediaType = "application/json";
            return content;
        }

        private Uri GetBaseAddress(HttpRequest request)
        {
            return new Uri("https://" + request.Hostname);
        }

        private IEnumerable<KeyValuePair<string, string>> ObjectToDictionary(object obj)
        {
            return obj.GetType().GetProperties(BindingFlags.Instance).ToDictionary(p => p.Name, p => p.GetValue(obj).ToString());
        }
    }
}
