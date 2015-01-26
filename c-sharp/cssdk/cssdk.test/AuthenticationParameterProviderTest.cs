using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace cssdk.test
{
    [TestClass]
    public class AuthenticationParameterProviderTest
    {
        private Mock<ISha1StringHasher> MockSha1StringHasher { get; set; }
        private Mock<IUnixTimeStampProvider> MockUnixTimeStampProvider { get; set; }
        private Mock<IRandomAlphaNumGenerator> MockRandomAlphaNumGenerator { get; set; }

        [TestInitialize]
        public void Setup()
        {
            MockSha1StringHasher = new Mock<ISha1StringHasher>();
            MockUnixTimeStampProvider = new Mock<IUnixTimeStampProvider>();
            MockRandomAlphaNumGenerator = new Mock<IRandomAlphaNumGenerator>();

            MockSha1StringHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns((string s) => s);
            MockUnixTimeStampProvider.Setup(x=>x.Get()).Returns("TIMESTAMP");
            MockRandomAlphaNumGenerator.Setup(x => x.Generate(10)).Returns((int n) => new string('a', n));
        }

        [TestMethod]
        public void Get_returns_the_authentication_parameter_using_the_hasher_and_unix_stampstamp_and_random_token_generator()
        {
            var provider = GetProvider();

            var param = provider.Get(new AuthenticationParameters
                {
                    ApiId = "API_ID",
                    ApiKey = "API_KEY",
                    Url = "https://use.cloudshare.com/api/v3/some/thing?foo=bar"
                });

            Assert.AreEqual("userapiid:API_ID;timestamp:TIMESTAMP;token:aaaaaaaaaa;hmac:API_KEYhttps://use.cloudshare.com/api/v3/some/thing?foo=barTIMESTAMPaaaaaaaaaa", param);
        }

        private AuthenticationParameterProvider GetProvider()
        {
            return new AuthenticationParameterProvider(MockSha1StringHasher.Object, MockUnixTimeStampProvider.Object, MockRandomAlphaNumGenerator.Object);
        }

    }
}
