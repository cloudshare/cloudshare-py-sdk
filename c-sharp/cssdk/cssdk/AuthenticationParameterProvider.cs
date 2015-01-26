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

namespace cssdk
{
    public interface IAuthenticationParameterProvider
    {
        string Get(AuthenticationParameters parameters);
    }

    public struct AuthenticationParameters
    {
        public string ApiId { get; set; }
        public string ApiKey { get; set; }
        public string Url { get; set; }
    }

    public class AuthenticationParameterProvider : IAuthenticationParameterProvider
    {
        private readonly ISha1StringHasher _sha1StringHasher;
        private readonly IUnixTimeStampProvider _unixTimeStampProvider;
        private readonly IRandomAlphaNumGenerator _randomAlphaNumGenerator;

        public AuthenticationParameterProvider(ISha1StringHasher sha1StringHasher, IUnixTimeStampProvider unixTimeStampProvider, IRandomAlphaNumGenerator randomAlphaNumGenerator)
        {
            _sha1StringHasher = sha1StringHasher;
            _unixTimeStampProvider = unixTimeStampProvider;
            _randomAlphaNumGenerator = randomAlphaNumGenerator;
        }

        public string Get(AuthenticationParameters parameters)
        {
            var timestamp = _unixTimeStampProvider.Get();
            var token = _randomAlphaNumGenerator.Generate(10);
            return String.Format("userapiid:{0};timestamp:{1};token:{2};hmac:{3}", parameters.ApiId, timestamp, token, GetHmac(parameters.ApiKey, parameters.Url, timestamp, token));
        }

        private string GetHmac(string apiKey, string url, string timestamp, string token)
        {
            var c = apiKey + url + timestamp + token;
            return _sha1StringHasher.Hash(c);
        }
    }
}