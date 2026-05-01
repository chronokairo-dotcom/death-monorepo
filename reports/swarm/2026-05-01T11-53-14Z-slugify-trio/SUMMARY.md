# Swarm run — slugify trio (Fase 1 demo)

- timestamp: 2026-05-01T11-53-14Z-slugify-trio
- workers: 3 (todos opencode-ai, paralelo)

| idx | id | tool | dir | exit | seconds | tests |
|---|---|---|---|---|---|---|
| 1 | ts | opencode | projects/swarm-demo-slugify/ts | 0 | 102 | ✅ 5/5 (node:test) |
| 2 | py | opencode | projects/swarm-demo-slugify/py | 143* | 757 | ✅ 4/4 (unittest) |
| 3 | go | opencode | projects/swarm-demo-slugify/go | 0 | 131 | ⚪ não rodado (go ausente no host) |

*Python: rc=143 = SIGTERM enviado pelo orquestrador depois que os testes já tinham passado (worker travou no fim depois de tudo verde — ver lições).

## Resultado

Os três módulos foram criados em paralelo a partir de um único spec em ~13min total (limitado pelo straggler Python; TS+Go terminaram em <2.5min).

## Lições da Fase 1

1. **Paralelismo real funciona**: 3 `opencode run` em pastas isoladas, zero conflito de arquivo. TS terminou em 102s, Go em 131s, em paralelo.
2. **Straggler problem**: 1 worker travado no fim segura a barca. Solução próxima: reportar resultado parcial assim que os outros terminam, com timeout agressivo por worker.
3. **opencode é honesto sobre o ambiente**: o worker Go reconheceu que `go` não estava instalado e apenas reportou os arquivos criados, sem alucinar resultado de teste.
4. **Spec format simples basta**: parser bash awk de ~30 linhas resolve. Não precisou de YAML real.
5. **Gemini ainda fora do swarm**: precisa `GEMINI_API_KEY`. Spec já suporta `tool: gemini`, é plug-and-play quando a key chegar.
6. **Custo**: 3 workers paralelos com Opus por baixo é ~3x o token de 1 worker, mas o speedup real só vale pra épicos com módulos genuinamente independentes.

## Próximos passos (Fase 2)

- [ ] Timeout por worker mais agressivo (5min) + soft-kill
- [ ] Adicionar `GEMINI_API_KEY` e testar mix opencode+gemini
- [ ] Tech-lead agent que escreve o .spec automaticamente a partir de um épico em texto livre
- [ ] Integrator step (lint + test geral + doc consolidado)
