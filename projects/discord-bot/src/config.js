export function loadConfig(env = process.env) {
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
  const missing = required.filter(v => !env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const config = {
    discordToken: env.DISCORD_TOKEN,
    discordClientId: env.DISCORD_CLIENT_ID,
    openaiApiKey: env.OPENAI_API_KEY,
    guildId: env.GUILD_ID,
  };

  return Object.freeze(config);
}
