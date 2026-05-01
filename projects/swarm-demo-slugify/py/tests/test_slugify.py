import unittest
from slugify_py import slugify


class TestSlugify(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(slugify("Hello World"), "hello-world")

    def test_acento(self):
        self.assertEqual(slugify("São Paulo"), "sao-paulo")

    def test_separator_custom(self):
        self.assertEqual(slugify("Hello World", "_"), "hello_world")

    def test_vazio(self):
        self.assertEqual(slugify(""), "")
        self.assertEqual(slugify("---"), "")


if __name__ == "__main__":
    unittest.main()
