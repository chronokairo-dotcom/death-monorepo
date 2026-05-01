import { SlashCommandBuilder } from 'discord.js';

const vibes = [
  'o vácuo te observa de volta >:)',
  'hoje é um bom dia pra desfragmentar a alma :>',
  'aleatório? não. predestinado? também não. só caótico. xD',
  'rolaram os dados cósmicos e deu... 7 :o',
  'a entropia te manda lembranças o/',
  'glitch detectado no timeline. seguindo mesmo assim. >_>',
];

export default {
  data: new SlashCommandBuilder()
    .setName('chaos')
    .setDescription('Recebe uma vibe caótica do void.'),
  async execute(interaction) {
    const pick = vibes[Math.floor(Math.random() * vibes.length)];
    await interaction.reply(pick);
  },
};
