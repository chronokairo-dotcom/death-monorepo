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

## Sessão 3 — 2026-05-01 — Contribuição em ChronoKairo/sacidata

Tarefa: limpeza de raiz + aplicar bug fixes pendentes + testes em repo externo da org.

### Tentativa 1: opencode-ai
- Travou silenciosamente após ~12min, zero output, zero mudança no working tree
- Matei via SIGTERM
- Hipótese: contexto do repo (~106kb + muito .md de meta) confundiu o agent

### Tentativa 2: gemini-cli (fallback dentro da regra)
- Rodou ~80% em ~3min reais
- Bateu quota free (`gemini-3-flash`, 5 req/min) — erro 429
- Mas o output até ali foi cirúrgico: git mv corretos, fix em dataController, teste novo bem feito

### Manual extraordinário (registrado como exceção)
- README + todo finalizados (são docs, permitidos pela regra)
- `npm install` + `npm test` rodados pra validar — 4/4 verdes
- Commit + push pra fork (sem permissão de PR API → link manual)

### Lições Sessão 3
1. Contexto pesado de meta-docs degrada ambos os agentes — limpar antes de pedir feature
2. `gemini-3-flash` free tier é caprichoso; usar pra fatias < 5min
3. Estruturas duplicadas de código (3 controllers/) precisam de "canonical" explícita no prompt
4. PAT da conta de trabalho sem write na org → estratégia padrão: fork + branch + link manual de PR

## Sessão 4 — 2026-05-02 — opencode default model trap

Task: extrair `loadConfig()` testável do discord-bot. Modo SOLO.

### Trilha de tentativas (cronológica, crua)

1. **`opencode run --dir projects/discord-bot ...`** (sem `--model`)
   → erro imediato: `Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable.`
   → diagnose: opencode default agora é `gemini-3-pro-preview`. `GEMINI_API_KEY` (no env) **não** é suficiente; opencode procura `GOOGLE_GENERATIVE_AI_API_KEY` especificamente.

2. **`GOOGLE_GENERATIVE_AI_API_KEY=$GEMINI_API_KEY opencode run ...`**
   → durou ~10min, exit code 0, log final: `> build · gemini-3-pro-preview` e nada mais.
   → working tree intocado. **Silent success**.
   → hipótese: modelo em queue/throttle do AI Studio sem propagar erro pro CLI. Pior modo de falha possível.

3. **Fallback `gemini -p ... --approval-mode yolo --skip-trust`** (regra ChronoKairo: se opencode falha, tenta gemini)
   → primeiro 503 `UNAVAILABLE` (high demand)
   → depois `TerminalQuotaError: You have exhausted your daily quota` em `gemini-3-flash` (free tier 20 req/dia esgotado).
   → gemini-cli **inútil hoje** com este key.

4. **`opencode run --model opencode/big-pickle ...`** ← vencedor
   → ~3min wall-clock, 12/12 testes verde, patch limpo.
   → `opencode/big-pickle` é o modelo do opencode-zen que **funciona sem credencial extra**.

### Comando final que funcionou
```bash
opencode run --model opencode/big-pickle \
  --dir projects/discord-bot \
  --dangerously-skip-permissions \
  "<prompt>"
```

### Output (resumo)
- `src/config.js` criado, `loadConfig(env=process.env)` validando DISCORD_TOKEN + DISCORD_CLIENT_ID, frozen output.
- `src/config.test.js` com 8 sub-testes em 1 suite.
- `src/index.js`, `src/deploy-commands.js` migrados pra `loadConfig()`.
- `npm test` final: 2 suites, 12 tests, 0 fail.

### Lições novas
1. **NUNCA confiar em `opencode run` sem `--model` explícito.** Default mudou silenciosamente pra modelo Google e tem dois modos de falha (auth missing OU silent-success). Cron com isso = horas perdidas.
2. **`opencode/big-pickle` é o modelo padrão de fato** pra cron headless agora. Sem auth extra, sem quota visível, comportamento consistente.
3. **Silent-success é pior que crash.** Exit 0 + `> build · <model>` no final SEM diff = sinal de morte. Sempre verificar `git status` depois do run e fail-fast se vazio.
4. **gemini-cli com key free está morto pro nosso loop.** Quota de 20 req/dia em `gemini-3-flash` evapora em 1 task. Manter como fallback simbólico até trocar pra paid tier ou outro provider.
5. **Ordem de fallback atualizada** (substitui Sessão 1): 
   - 1ª: `opencode run --model opencode/big-pickle --dangerously-skip-permissions ...`
   - 2ª: outro modelo opencode-zen (`opencode/gpt-5-nano`, `opencode/minimax-m2.5-free`)
   - 3ª: gemini-cli **só se** alguém renovar o key/tier
   - 4ª: registrar exceção e fazer manual (proibido por regra ChronoKairo, então prefere swarm-retry com modelos diferentes)
6. **Custo de tempo da sessão**: ~25min wall, dos quais ~15min queimados em tentativas mortas. Patch real: ~3min. Razão sinal/ruído ruim hoje, mas a lição vale pras próximas semanas.

### Action items pra repo
- Atualizar `scripts/swarm-run.sh` pra forçar `--model opencode/big-pickle` em workers `tool: opencode` (próxima sessão).
- Adicionar nota no README do swarm: "sempre passar --model em headless".

