const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "mark",
    description: "identifies your mark",
    dm_permissions: "0",
  },
  async execute(interaction, client) {
    const random = Math.floor(Math.random() * 3);
    const server = random == 0 ? "HQ" : random == 1 ? "R&D" : "Archives";
    const color = random == 0 ? +process.env.COLOR_HQ : random == 1 ? +process.env.COLOR_RND : +process.env.COLOR_ARCHIVES;

    const embed = new EmbedBuilder()
      .setTitle(":game_die: Result :game_die:")
      .setDescription(`**Your mark is:** ${server}`)
      .setColor(color);

    await interaction.reply({ embeds: [embed] });
  },
};
