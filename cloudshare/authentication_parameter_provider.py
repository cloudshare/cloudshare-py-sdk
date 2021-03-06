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
import time


class AuthenticationParameterProvider(object):

    def __init__(self, tokenGenerator, hmacer):
        self.tokenGenerator = tokenGenerator
        self.hmacer = hmacer

    def get(self, apiId, apiKey, url):
        timestamp = int(time.time())
        token = self.tokenGenerator.generate()
        return "userapiid:%s;timestamp:%d;token:%s;hmac:%s" % (
            apiId,
            timestamp,
            token,
            self.hmacer.hash("%s%s%d%s" % (apiKey, url, timestamp, token)))
