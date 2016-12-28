import unittest
import mock
import os
from .. import req

REAL_KEYS_AVAILABLE = 'CLOUDSHARE_API_ID' in os.environ and 'CLOUDSHARE_API_KEY' in os.environ

class TestIntegration(unittest.TestCase):

    @unittest.skipUnless(REAL_KEYS_AVAILABLE,
                         "This test only runs if CLOUDSHARE_API_{ID,KEY} envars are defined.")
    def test_get_projects(self):
		API_KEY = os.environ['CLOUDSHARE_API_KEY']
		API_ID = os.environ['CLOUDSHARE_API_ID']
		res = req(hostname="use.cloudshare.com",
			method='GET',
			apiId=API_ID,
			apiKey=API_KEY,
			path='projects')
		assert(res.status / 100 == 2)
