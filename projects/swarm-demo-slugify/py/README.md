# slugify-py

A pure Python slugify library. Converts text to URL-friendly slugs.

## Usage

```python
from slugify_py import slugify

slugify("São Paulo")  # "sao-paulo"
slugify("Hello World", "_")  # "hello_world"
```

## Test

```bash
python -m unittest
```
