import unicodedata
import re


def slugify(text: str, separator: str = "-") -> str:
    text = unicodedata.normalize("NFD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", separator, text)
    text = text.strip(separator)
    return text
