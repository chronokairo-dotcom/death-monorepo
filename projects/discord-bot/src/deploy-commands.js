import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Need DISCORD_TOKEN and CLIENT_ID in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = join(__dirname, 'commands');
for (const file of readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const mod = await import(pathToFileURL(join(commandsPath, file)).href);
  const cmd = mod.default ?? mod;
  if (cmd?.data) commands.push(cmd.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

try {
  console.log(`Deploying ${commands.length} commands...`);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  const data = await rest.put(route, { body: commands });
  console.log(`:> deployed ${data.length} commands ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
