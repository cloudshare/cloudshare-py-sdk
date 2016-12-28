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
import urllib2


class Http(object):

    def request(self, method, url, headers, content):
        req = self._build_request(method, url, headers, content)
        try:
            f = urllib2.urlopen(req)
            return Response(status=f.getcode(), content=f.read())
        except urllib2.HTTPError as e:
            return Response(status=e.getcode(), content=e.read())

    def _build_request(self, method, url, headers, content):
        headers = self._add_content_length_header_if_needed(
            method, headers, content)
        req = urllib2.Request(url=url,
                              data=content,
                              headers=headers)
        req.get_method = lambda: method
        return req

    def _add_content_length_header_if_needed(self, method, headers, content):
        if headers is None:
            headers = {}
        if method == 'PUT' or method == 'POST':
            headers['Content-Length'] = len(content) if content is not None else 0
        return headers


class Response:

    def __init__(self, status, content):
        self.status = status
        self.content = content
