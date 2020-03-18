import unittest
from ..hmacer import HMACer


class TestHMACer(unittest.TestCase):

    def test_hash_returns_the_correct_hash_for_hello_world(self):
        hmacer = HMACer()

        result = hmacer.hash("hello world")

        self.assertEqual(result, "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed")
