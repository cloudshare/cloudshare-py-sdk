import unittest
import re
from ..token_generator import TokenGenerator


class TestTokenGenerator(unittest.TestCase):

    def test_generate_returns_a_10_length_random_string_of_digits_and_letters_each_call(self):
        generator = TokenGenerator()

        results = [generator.generate() for _ in range(100)]

        self.assertNotIn(None, [re.search(r"^\w{10}$", r) for r in results])

    def test_generate_returns_a_different_10_length_random_strings_of_digits_and_letters_each_call(self):
        generator = TokenGenerator()

        results = set([generator.generate() for _ in range(100)])

        self.assertEqual(100, len(results))
