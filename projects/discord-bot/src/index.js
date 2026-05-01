import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { chat } from './llm.js';
import { remember, recall } from './memory.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

const commandsPath = join(__dirname, 'commands');
for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const mod = await import(pathToFileURL(join(commandsPath, file)).href);
  const cmd = mod.default ?? mod;
  if (cmd?.data && cmd?.execute) {
    client.commands.set(cmd.data.name, cmd);
  } else {
    console.warn(`[warn] command ${file} missing data/execute export`);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`:> logged in as ${c.user.tag} — ${client.commands.size} commands ready`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    const reply = { content: 'something exploded :o', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Conversational mode: respond when mentioned or DMed.
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const isDM = !message.guild;
  const mentioned = message.mentions.users.has(client.user.id);
  if (!isDM && !mentioned) return;

  const text = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
  if (!text) return;

  await message.channel.sendTyping();
  const history = recall(message.channelId);
  try {
    const reply = await chat([
      ...history,
      { role: 'user', content: `${message.author.username}: ${text}` },
    ]);
    remember(message.channelId, 'user', `${message.author.username}: ${text}`);
    remember(message.channelId, 'assistant', reply);
    // Discord caps at 2000 chars per message
    for (let i = 0; i < reply.length; i += 2000) {
      await message.reply({
        content: reply.slice(i, i + 2000),
        allowedMentions: { repliedUser: false },
      });
    }
  } catch (err) {
    console.error('[message]', err.message);
    await message.reply({
      content: `deu ruim no LLM: \`${err.message}\` >_>`,
      allowedMentions: { repliedUser: false },
    });
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in env. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
