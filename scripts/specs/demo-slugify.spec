epic: slugify trio
integrator_dir: projects/swarm-demo-slugify
---
worker: ts
tool: opencode
dir: projects/swarm-demo-slugify/ts
prompt: |
  Crie uma lib TypeScript chamada slugify.
  Arquivos:
  - package.json com {"name":"@swarm/slugify-ts","version":"0.1.0","type":"module","main":"index.js","scripts":{"test":"node --test"}}
  - index.ts (e compile pra index.js): export function slugify(input: string, opts?: {separator?: string}): string. Lowercase, troca espaços e símbolos por separator (default '-'), remove acentos via NFD, colapsa separators, trim das pontas.
  - index.test.js: 4 testes node:test cobrindo basic, acento (São Paulo -> sao-paulo), separator custom, edge case string vazia.
  - README.md curto.
  Não use deps. Apenas Node nativo (stdlib). Garanta que `node --test` passa.
---
worker: py
tool: opencode
dir: projects/swarm-demo-slugify/py
prompt: |
  Crie uma lib Python pura chamada slugify_py.
  Arquivos:
  - pyproject.toml mínimo (name slugify-py, version 0.1.0, python>=3.8)
  - slugify_py/__init__.py com def slugify(text: str, separator: str = "-") -> str. Lowercase, NFD (unicodedata) pra strip acentos, troca não-alfanuméricos por separator, colapsa, trim.
  - tests/test_slugify.py com unittest cobrindo: basic, acento (São Paulo -> sao-paulo), separator custom, vazio. Roda com `python -m unittest`.
  - README.md curto.
  Sem deps externas. Garanta que `python -m unittest` passa.
---
worker: go
tool: opencode
dir: projects/swarm-demo-slugify/go
prompt: |
  Crie um pacote Go chamado slugify.
  Arquivos:
  - go.mod (module github.com/chronokairo-dotcom/death-monorepo/projects/swarm-demo-slugify/go, go 1.21)
  - slugify.go com func Slugify(s string, separator string) string. Lowercase, normaliza unicode (golang.org/x/text/unicode/norm NFD se quiser, mas prefira sem deps externas — implemente com runes manualmente removendo combining marks via unicode.IsMark). Troca não-alfanum por separator, colapsa, trim.
  - slugify_test.go com 4 casos: basic, "São Paulo" -> "sao-paulo", separator custom "_", vazio.
  - README.md curto.
  Use APENAS stdlib (unicode, unicode/utf8, strings). Garanta que `go test ./...` passa.
---
