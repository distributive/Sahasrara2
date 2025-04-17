/**
 * 2025 Elevation scoop.
 *
 * @file   This files defines scoop command.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("scoop")
  .setDescription("scoop?");

const meta = {};

async function execute(interaction, client) {
  const embed = new EmbedBuilder()
    .setTitle(":warning: We have a job offer :warning:")
    .setDescription(`Do you \`/accept\`?`)
    .setColor(+process.env.COLOR_INFO);
  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
