# slugify

Go package to generate URL-friendly slugs from strings using only the standard library.

## Usage

```go
import slugify "github.com/chronokairo-dotcom/death-monorepo/projects/swarm-demo-slugify/go"

slug := slugify.Slugify("São Paulo", "-") // "sao-paulo"
```

## Behavior

- Lowercases all input characters
- Removes Unicode combining marks (diacritics) via `unicode.IsMark`
- Replaces non-alphanumeric characters with the provided separator
- Collapses consecutive separators and trims leading/trailing separators
- Zero external dependencies
