# @swarm/slugify-ts

Tiny slugify function in TypeScript using only Node stdlib.

## Usage

```ts
import { slugify } from "@swarm/slugify-ts";

slugify("São Paulo"); // "sao-paulo"
slugify("Hello World", { separator: "_" }); // "hello_world"
```

## Test

```
node --test
`
```
