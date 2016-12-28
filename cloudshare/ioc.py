# Copyright 2015 CloudShare Inc.

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


def get_requester():
    from requester import Requester
    return Requester(get_http(), get_auth_param_provider())


def get_auth_param_provider():
    from authentication_parameter_provider import AuthenticationParameterProvider
    return AuthenticationParameterProvider(get_token_generator(), get_hmacer())


def get_token_generator():
    from token_generator import TokenGenerator
    return TokenGenerator()


def get_http():
    from http import Http
    return Http()


def get_hmacer():
    from hmacer import HMACer
    return HMACer()
