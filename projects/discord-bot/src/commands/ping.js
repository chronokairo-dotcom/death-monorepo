import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! Mostra a latência.'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'pinging...', fetchReply: true });
    const rtt = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = Math.round(interaction.client.ws.ping);
    await interaction.editReply(`pong :> rtt \`${rtt}ms\` · ws \`${ws}ms\``);
  },
};
