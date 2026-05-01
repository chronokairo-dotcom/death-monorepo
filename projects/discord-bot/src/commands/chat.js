import { SlashCommandBuilder } from 'discord.js';
import { chat } from '../llm.js';
import { remember, recall } from '../memory.js';

export default {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Conversa com o bot.')
    .addStringOption((o) =>
      o.setName('mensagem').setDescription('o que falar').setRequired(true).setMaxLength(1500),
    ),
  async execute(interaction) {
    const msg = interaction.options.getString('mensagem', true);
    await interaction.deferReply();
    const history = recall(interaction.channelId);
    try {
      const reply = await chat([...history, { role: 'user', content: msg }]);
      remember(interaction.channelId, 'user', msg);
      remember(interaction.channelId, 'assistant', reply);
      await interaction.editReply(reply.slice(0, 2000));
    } catch (err) {
      console.error('[chat]', err.message);
      await interaction.editReply(`deu ruim no LLM: \`${err.message}\` >_>`);
    }
  },
};
