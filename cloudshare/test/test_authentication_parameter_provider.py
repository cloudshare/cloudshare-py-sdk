import unittest
import mock
from ..authentication_parameter_provider import AuthenticationParameterProvider


class TestAuthenticationParameterProvider(unittest.TestCase):

    def test_get_returns_a_string_matching_the_auth_param_template(self):
        hmacer = mock.Mock()
        hmacer.hash = mock.Mock(return_value="HASHED_VALUE")
        tokenGenerator = mock.Mock()
        tokenGenerator.generate = mock.Mock(return_value="TOKEN123")
        provider = AuthenticationParameterProvider(tokenGenerator, hmacer)

        result = provider.get(apiId='API_ID',
                              apiKey='API_KEY',
                              url='https://somehost.com/api/v3/callme')

        self.assertRegex(
            result, r'^userapiid:\w+;timestamp:\d+;token:TOKEN123;hmac:HASHED_VALUE$')

    def test_get_passes_the_concatenated_values_of_apiKey_url_timestamp_and_token_to_hmacer(self):
        hmacer = mock.Mock()
        hmacer.hash = mock.Mock(return_value="HASHED_VALUE")
        tokenGenerator = mock.Mock()
        tokenGenerator.generate = mock.Mock(return_value="TOKEN123")
        provider = AuthenticationParameterProvider(tokenGenerator, hmacer)

        provider.get(apiId='API_ID',
                     apiKey='API_KEY',
                     url='https://somehost.com/api/v3/callme')

        self.assertRegex(hmacer.hash.call_args[0][
                                 0], r"API_KEYhttps://somehost.com/api/v3/callme\d+TOKEN123")
