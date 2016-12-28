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
import json
import urllib
from http import Response


class Requester(object):

    def __init__(self, http, authenticationParameterProvider):
        self.http = http
        self.authenticationParameterProvider = authenticationParameterProvider

    def request(self, hostname, method, apiId, apiKey, path="", queryParams=None, content=None):
        url = self._build_url(hostname, path, queryParams)
        json_content = json.dumps(content) if content is not None else None
        headers = self._build_headers(apiId, apiKey, url)
        res = self.http.request(method, url, headers, json_content)
        return Response(status=res.status, content=self._try_to_parse_json(res.content))

    def _build_headers(self, apiId, apiKey, url):
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'cs_sha1 %s' % self.authenticationParameterProvider.get(apiId=apiId,
                                                                                     apiKey=apiKey,
                                                                                     url=url)
        }

    def _build_url(self, hostname, path, queryParams):
        base = "https://%s/api/v3/%s" % (hostname,
                                         self._condition_path_string(path))
        if queryParams:
            return "%s?%s" % (base, urllib.urlencode(queryParams))
        else:
            return base

    def _condition_path_string(self, path):
        return '/'.join(path.strip('/ ').split('/'))

    def _try_to_parse_json(self, string):
        try:
            return json.loads(string)
        except:
            return None
