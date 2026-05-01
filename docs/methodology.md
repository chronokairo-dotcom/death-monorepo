# Metodologia opencode-ai — diário de bordo

Este documento cresce a cada execução do `opus-techleader-opencode`.

## Sessão 0 — Setup
- `opencode-ai` instalado globalmente via npm (versão fixada em runtime)
- Driver: `acpx opencode` (alias built-in)
- Conta: chronokairo-dotcom
- Working dir: o próprio death-monorepo

## Sessão 1 — 2026-05-01 — discord-bot: testes para memory.js

### Reconhecimento do ambiente
- Binário real instalado: `/usr/bin/opencode` (v1.14.30) — não `opencode-ai`. O alias da spec funciona pq é o mesmo CLI.
- Primeira invocação faz migração SQLite (~segundos). Não assustar.
- `opencode providers list` mostrou **0 credenciais** — porém o `run` funcionou mesmo assim, então provavelmente está pegando credencial via env/plugin do host (OpenClaw). Não bloqueou.
- ACPX não foi necessário; `opencode run --dir <path> "<prompt>"` resolveu direto. Mais simples = melhor.

### Comando que funcionou
```bash
opencode run --dir projects/discord-bot --dangerously-skip-permissions \
  "Add unit tests for src/memory.js using node:test (no new deps). \
   Create src/memory.test.js covering remember/recall/forget plus MAX_TURNS \
   rolling-window cap. Add 'test' script in package.json that runs node --test. \
   Run npm test to verify."
```

Sem `--dangerously-skip-permissions` o run trava esperando aprovação interativa — fatal num cron headless. **Sempre passar essa flag em modo automatizado.**

### O que rolou
- opencode leu `src/memory.js`, escreveu `src/memory.test.js` com 4 testes (`describe`/`test` do `node:test`).
- Editou `package.json` adicionando `"test": "node --test src/"`.
- Rodou `npm install` automaticamente (instalou 119 pacotes pra discord.js etc.) — ok pq node_modules está em `.gitignore`.
- **Primeira execução falhou:** `node --test src/` recursivo pegou `index.js` que importa `discord.js` e estourou erro de runtime (token faltando) — 1 fail.
- opencode **diagnosticou sozinho** e corrigiu o glob pra `node --test src/**/*.test.js`.
- Segunda rodada: 4/4 pass. ✓

### Lições
1. **Headless = `--dangerously-skip-permissions` obrigatório.** Sem ela, qualquer write/exec pede confirmação e o processo fica preso.
2. **`--dir <subpath>` mantém escopo limpo.** opencode opera só dentro do projeto, sem poluir o resto do monorepo.
3. **Glob de testes:** `node --test src/` é recursivo e pega TUDO que tem top-level side effects. Sempre filtrar com `*.test.js`. Boa lição genérica de Node, mas opencode caiu no buraco antes de corrigir — o agente itera, mas itera *no teu disco*.
4. **opencode ITERA até passar.** Quando `npm test` falhou, ele leu output, hipótese, fix, re-rodou. Não desistiu na primeira. Bom sinal pra delegar tarefas com loop de verificação embutido (`...e rode X pra confirmar`).
5. **Saída poluída pra parsing**: muito ANSI/TAP misturado. Pra logs limpos talvez `--format json` numa próxima.
6. **Custo de tempo:** ~1m50s pra essa task pequena (incluindo `npm install`). Em prompts maiores, planejar timeout >5min.

### Próxima vez tentar
- `--format json` pra coletar tool-calls estruturados e resumir o que opencode fez sem regex frágil.
- Prompt incluindo "do not run npm install if node_modules exists" pra economizar tempo.
- Testar `acpx telephone game` em uma task mais ambígua pra comparar com o `run` direto.

## Sessão 2 — 2026-05-01 — Swarm coding Fase 1

Implementei `scripts/swarm-run.sh` + spec format próprio. Demo: 3 workers opencode-ai em paralelo criaram libs slugify em TS, Python, Go.

### Comando
```bash
bash scripts/swarm-run.sh scripts/specs/demo-slugify.spec
```

### Resultado bruto
- TS: 102s, 5/5 testes ✓
- Go: 131s, arquivos criados (go não instalado pra rodar testes local)
- Python: rc=143 (SIGTERM), mas testes 4/4 passaram antes de travar no fim

### Aprendizados
1. **Paralelismo via bash `&` + `wait` é suficiente** pra Fase 1. Não precisou de orquestrador externo.
2. **Straggler problem é real**: 1 worker travado segura tudo. Em Fase 2: timeout agressivo + cancel pro restante.
3. **opencode-ai não alucina resultado de teste**: worker Go falou "go ausente, só criei arquivos" em vez de inventar passing.
4. **Spec format leve com awk parser** funciona — não precisa de YAML real pra MVP.
5. **Pra mix com gemini**: precisa GEMINI_API_KEY; CLI testada (v0.40.1, modo `-p ... --approval-mode yolo`).
