import { SlashCommandBuilder } from 'discord.js';
import { forget } from '../memory.js';

export default {
  data: new SlashCommandBuilder()
    .setName('forget')
    .setDescription('Esquece o histórico de conversa deste canal.'),
  async execute(interaction) {
    forget(interaction.channelId);
    await interaction.reply({ content: 'memória deste canal: limpa :> ', ephemeral: true });
  },
};
