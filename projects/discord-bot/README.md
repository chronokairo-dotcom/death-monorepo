# discord-bot :>

Bot de Discord — chaos engine. Construído com [discord.js v14](https://discord.js.org/) e Node 18+.

## Setup

```bash
npm install
cp .env.example .env
# edita .env com DISCORD_TOKEN, CLIENT_ID e (opcional) GUILD_ID
npm run deploy   # registra slash commands
npm start
```

### Como conseguir os tokens

1. Vai em https://discord.com/developers/applications → **New Application**
2. Aba **Bot** → reseta token, copia pra `DISCORD_TOKEN`
3. Aba **General Information** → copia o **Application ID** pra `CLIENT_ID`
4. Pra teste rápido em um servidor só, pega o **Guild ID** (ativa modo dev no Discord, clica com botão direito no server → Copy ID) e bota em `GUILD_ID`. Comandos de guild propagam na hora; globais demoram até 1h.
5. Na aba **OAuth2 → URL Generator**, marca `bot` + `applications.commands`, escolhe permissões (mínimo: `Send Messages`), e usa a URL pra convidar o bot no teu server.

## Comandos

- `/ping` — latência
- `/say texto:<msg>` — bot ecoa a mensagem
- `/chaos` — vibe caótica aleatória
- `/chat mensagem:<msg>` — conversa com o bot via LLM
- `/forget` — limpa histórico de conversa do canal

## Modo conversacional

Menciona o bot (`@bot oi tudo bem?`) ou manda DM e ele responde via LLM com personalidade Laciels.
Mantém memória curta por canal (~12 turnos) que reseta no restart ou com `/forget`.

### Configuração do LLM

Funciona com qualquer API OpenAI-compatível:

- **OpenAI:** `LLM_BASE_URL=https://api.openai.com/v1` · `LLM_MODEL=gpt-4o-mini`
- **Groq:** `LLM_BASE_URL=https://api.groq.com/openai/v1` · `LLM_MODEL=llama-3.3-70b-versatile`
- **OpenRouter:** `LLM_BASE_URL=https://openrouter.ai/api/v1` · `LLM_MODEL=anthropic/claude-3.5-sonnet`
- **Local (llama.cpp/ollama):** `LLM_BASE_URL=http://localhost:11434/v1` · `LLM_MODEL=llama3.1`

## Estrutura

```
src/
  index.js              # entrypoint, carrega comandos e listeners
  deploy-commands.js    # registra slash commands na API do Discord
  commands/
    ping.js
    say.js
    chaos.js
```

Adicionar comando novo: cria `src/commands/<nome>.js` exportando `{ data, execute }`, roda `npm run deploy`.

## Systemd service

O bot roda como serviço `discord-bot.service` (auto-start no boot, restart on failure).

**Unit file:** `/etc/systemd/system/discord-bot.service`

### Comandos do dia-a-dia

```bash
systemctl status discord-bot      # ver status
systemctl restart discord-bot     # reiniciar (depois de mexer em .env ou code)
systemctl stop discord-bot        # parar
systemctl start discord-bot       # subir
systemctl disable discord-bot     # tirar do boot
systemctl enable discord-bot      # voltar pro boot
journalctl -u discord-bot -f      # logs ao vivo
journalctl -u discord-bot -n 100  # últimas 100 linhas
```

### Detalhes

- `WorkingDirectory`: `/root/.openclaw/workspace/discord-bot`
- `EnvironmentFile`: `.env` do projeto (mexeu lá → `systemctl restart discord-bot`)
- `Restart=on-failure` com `RestartSec=5`
- Logs vão pro journald (identifier: `discord-bot`)
- Hardening básico: `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`

### Atualizar o bot

```bash
cd /root/.openclaw/workspace/discord-bot
git pull
npm install                       # se package.json mudou
npm run deploy                    # se comandos mudaram
systemctl restart discord-bot
```

## License

MIT
