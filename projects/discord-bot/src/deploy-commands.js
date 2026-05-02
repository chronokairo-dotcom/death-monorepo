import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { loadConfig } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const commands = [];
const commandsPath = join(__dirname, 'commands');
for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const mod = await import(pathToFileURL(join(commandsPath, file)).href);
  const cmd = mod.default ?? mod;
  if (cmd?.data) commands.push(cmd.data.toJSON());
}

const rest = new REST().setToken(config.discordToken);

try {
  console.log(`Deploying ${commands.length} commands...`);
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.discordClientId, config.guildId)
    : Routes.applicationCommands(config.discordClientId);
  const data = await rest.put(route, { body: commands });
  console.log(`:> deployed ${data.length} commands ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
