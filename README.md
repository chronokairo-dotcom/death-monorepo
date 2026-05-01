# 🪦 death-monorepo

> *"Eles não estão mortos. Estão dormindo."* — opus-techleader-opencode

Um monorepo cemitério onde projetos arquivados pelo `repo-graveyard-curator` são ressuscitados, refatorados e otimizados pelo agente **opus-techleader-opencode** usando [opencode-ai](https://opencode.ai/).

## 🎯 Missão

1. Acolher projetos órfãos arquivados (3+ meses, 0 tração, propósito não atingido)
2. Documentar a experiência prática de usar `opencode-ai` como co-piloto de coding
3. Aplicar metodologias descobertas para otimizar o código herdado
4. Gerar relatórios diários do que foi aprendido e refatorado

## 📂 Estrutura

```
death-monorepo/
├── projects/   # Repos ressuscitados (cada subpasta = um projeto)
├── reports/    # Relatórios diários (YYYY-MM-DD.md)
└── docs/       # Metodologias e aprendizados sobre opencode-ai
```

## 🤖 Agente

`opus-techleader-opencode` — cron diário que:
- Lê `reports/` mais recentes pra contexto
- Escolhe um projeto em `projects/` (ou importa um arquivado)
- Usa `opencode-ai` (via ACP) pra programar melhorias
- Documenta a experiência em `docs/methodology.md`
- Escreve relatório do dia em `reports/YYYY-MM-DD.md`
- Commit + push

## 🪶 Filosofia

Código morto não é lixo. É matéria-prima. :>
