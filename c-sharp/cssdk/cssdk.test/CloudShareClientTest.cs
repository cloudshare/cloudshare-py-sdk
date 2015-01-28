using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace cssdk.test
{
    [TestClass]
    public class CloudShareClientTest
    {
        private Mock<IHttp> MockHttp { get; set; }
        private Mock<IAuthenticationParameterProvider> MockAuthenticationParameterProvider { get; set; }

        [TestInitialize]
        public void Setup()
        {
            MockHttp = new Mock<IHttp>();
            MockAuthenticationParameterProvider = new Mock<IAuthenticationParameterProvider>();
        }

        [TestMethod]
        public void ReqAsync_throws_HostnameMissingException_if_not_given_a_hostname()
        {
            var client = GetCloudShareClient();

            try
            {
                client.ReqAsync(new Request
                    {
                        ApiId = "API_ID",
                        ApiKey = "API_KEY",
                        Hostname = null,
                        Method = HttpMethodEnum.POST
                    }).Wait();
            }
            catch (AggregateException e)
            {
                Assert.AreEqual(typeof(HostnameMissingException), e.InnerException.GetType());
                return;
            }

            Assert.Fail();
        }

        [TestMethod]
        public void ReqAsync_throws_ApiIdMissingException_if_not_given_ApiId()
        {
            var client = GetCloudShareClient();

            try
            {
                client.ReqAsync(new Request
                    {
                        ApiId = null,
                        ApiKey = "API_KEY",
                        Hostname = "some.hostname.com",
                        Method = HttpMethodEnum.POST
                    }).Wait();
            }
            catch (AggregateException e)
            {
                Assert.AreEqual(typeof(ApiIdMissingException), e.InnerException.GetType());
                return;
            }

            Assert.Fail();
        }

        [TestMethod]
        public void ReqAsync_throws_ApiKeyMissingException_if_not_given_ApiKey()
        {
            var client = GetCloudShareClient();

            try
            {
                client.ReqAsync(new Request
                    {
                        ApiId = "API_ID",
                        ApiKey = null,
                        Hostname = "some.hostname.com",
                        Method = HttpMethodEnum.POST
                    }).Wait();
            }
            catch (AggregateException e)
            {
                Assert.AreEqual(typeof(ApiKeyMissingException), e.InnerException.GetType());
                return;
            }

            Assert.Fail();

        }

        [TestMethod]
        public void ReqAsync_passes_the_given_hostname_and_method_to_Http_Req()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
                {
                    ApiId = "API_ID",
                    ApiKey = "API_KEY",
                    Hostname = "some.hostname.com",
                    Method = HttpMethodEnum.POST
                }).Wait();

            MockHttp.Verify(x=>x.ReqAsync(It.Is<HttpRequest>(r=>r.Hostname=="some.hostname.com" && r.Method==HttpMethodEnum.POST)));
        }

        [TestMethod]
        public void ReqAsync_passes_the_headers_content_type_and_accept_and_authorization_to_Http_Req()
        {
            MockAuthenticationParameterProvider.Setup(x=>x.Get(It.IsAny<AuthenticationParameters>())).Returns("AUTH_PARAM");
            var hr = default(HttpRequest);
            MockHttp.Setup(x => x.ReqAsync(It.IsAny<HttpRequest>())).Returns((HttpRequest r) =>
                {
                    hr = r;
                    return Task.FromResult(default(HttpResponse));
                });
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST
            }).Wait();

            var headers = new Dictionary<string, string>
                {
                    {"Accept", "application/json"},
                    {"Authorization", "cs_sha1 AUTH_PARAM"}
                };
            MockHttp.Verify(x => x.ReqAsync(It.Is<HttpRequest>(r => AreDictionariesEqual(r.Headers, headers))));
        }

        [TestMethod]
        public void ReqAsync_passes_the_credentials_and_url_with_query_string_to_AuthenticationParameterProvider_Get()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST,
                Path = "some/path",
                QueryParams = new
                    {
                        foo = "bar",
                        envId = 555
                    }
            }).Wait();

            var authParams = new AuthenticationParameters
                {
                    ApiId = "API_ID",
                    ApiKey = "API_KEY",
                    Url = "https://some.hostname.com/api/v3/some/path?foo=bar&envId=555"
                };
            MockAuthenticationParameterProvider.Verify(x => x.Get(authParams));
        }

        [TestMethod]
        public void ReqAsync_passes_the_credentials_and_url_without_query_string_to_AuthenticationParameterProvider_Get()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST,
                Path = "some/path",
                QueryParams = null
            }).Wait();

            var authParams = new AuthenticationParameters
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Url = "https://some.hostname.com/api/v3/some/path"
            };
            MockAuthenticationParameterProvider.Verify(x => x.Get(authParams));
        }

        [TestMethod]
        public void ReqAsync_pass_the_path_with_query_string_to_Http_Req()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST,
                Path = "some/path",
                QueryParams = new
                {
                    foo = "bar",
                    envId = 555
                }
            }).Wait();

            MockHttp.Verify(x => x.ReqAsync(It.Is<HttpRequest>(r => r.Path == "/api/v3/some/path?foo=bar&envId=555")));
        }

        [TestMethod]
        public void ReqAsync_pass_the_path_without_query_string_to_Http_Req()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST,
                Path = "some/path",
                QueryParams = null
            }).Wait();

            MockHttp.Verify(x => x.ReqAsync(It.Is<HttpRequest>(r => r.Path == "/api/v3/some/path")));
        }

        [TestMethod]
        public void ReqAsync_pass_the_given_body_object_as_a_json_object()
        {
            var client = GetCloudShareClient();

            client.ReqAsync(new Request
            {
                ApiId = "API_ID",
                ApiKey = "API_KEY",
                Hostname = "some.hostname.com",
                Method = HttpMethodEnum.POST,
                Path = "some/path",
                Body = new
                    {
                        id = 123,
                        foo = new
                            {
                                bang = "boom",
                                johnny = 777
                            }
                    }
            }).Wait();

            MockHttp.Verify(x => x.ReqAsync(It.Is<HttpRequest>(r => r.Body == "{\"id\":123,\"foo\":{\"bang\":\"boom\",\"johnny\":777}}")));
        }

        private bool AreDictionariesEqual(IDictionary<string, string> a, IDictionary<string, string> b)
        {
            return a.Count == b.Count && a.All(kv => b.ContainsKey(kv.Key) && b[kv.Key] == kv.Value);
        }

        private CloudShareClient GetCloudShareClient()
        {
            return new CloudShareClient(MockHttp.Object, MockAuthenticationParameterProvider.Object);
        }
    }
}
