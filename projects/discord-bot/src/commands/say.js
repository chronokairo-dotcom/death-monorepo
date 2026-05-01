import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faz o bot ecoar uma mensagem.')
    .addStringOption((o) =>
      o.setName('texto').setDescription('o que falar').setRequired(true).setMaxLength(2000),
    ),
  async execute(interaction) {
    const text = interaction.options.getString('texto', true);
    await interaction.reply({ content: text, allowedMentions: { parse: [] } });
  },
};
