import unittest
from mock import Mock
from ..requester import Requester


class TestRequester(unittest.TestCase):

    def test_request_passes_the_url_without_path_and_without_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY")

        url = http.request.call_args[0][1]
        self.assertEqual("https://some.hostname.com/api/v3/", url)

    def test_request_passes_the_url_with_path_and_without_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path="some/path")

        url = http.request.call_args[0][1]
        self.assertEqual("https://some.hostname.com/api/v3/some/path", url)

    def test_request_passes_the_url_with_path_prefixed_and_without_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path="/some/path")

        url = http.request.call_args[0][1]
        self.assertEqual("https://some.hostname.com/api/v3/some/path", url)

    def test_request_passes_the_url_with_path_suffixed_and_without_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path="some/path/")

        url = http.request.call_args[0][1]
        self.assertEqual("https://some.hostname.com/api/v3/some/path", url)

    def test_request_passes_the_url_with_path_with_spaces_slashes_and_without_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path=" /some/path/ ")

        url = http.request.call_args[0][1]
        self.assertEqual("https://some.hostname.com/api/v3/some/path", url)

    def test_request_passes_the_url_with_path_and_with_query_string(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock()
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path="some/path",
                          queryParams={'foo': 'bar', 'aaa': 123})

        url = http.request.call_args[0][1]
        self.assertEqual(
            "https://some.hostname.com/api/v3/some/path?foo=bar&aaa=123", url)

    def test_request_passes_all_required_headers(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock(return_value="AUTH_PARAM")
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY")

        headers = http.request.call_args[0][2]
        self.assertEqual({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'cs_sha1 AUTH_PARAM'
        }, headers)

    def test_request_passes_apiId_apiKey_and_url_to_authenticationParameterProvider(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock(return_value="AUTH_PARAM")
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="GET",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          path="envs")

        kwargs = authParamProvider.get.call_args[1]
        self.assertEqual(
            'https://some.hostname.com/api/v3/envs', kwargs['url'])

    def test_request_passes_a_json_string_content_to_http_request(self):
        http = Mock()
        http.request = Mock()
        authParamProvider = Mock()
        authParamProvider.get = Mock(return_value="AUTH_PARAM")
        requester = Requester(http, authParamProvider)

        requester.request(hostname="some.hostname.com",
                          method="POST",
                          apiId="API_ID",
                          apiKey="API_KEY",
                          content={'foo': {'aaa': 123}, 'bar': 'chicka'})

        content = http.request.call_args[0][3]
        self.assertEqual('{"foo": {"aaa": 123}, "bar": "chicka"}', content)
