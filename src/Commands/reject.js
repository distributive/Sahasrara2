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
  .setName("reject")
  .setDescription("reject the job");

const meta = {
  hideFromHelp: true,
};

async function execute(interaction, client) {
  const embed = new EmbedBuilder()
    .setDescription(`Oh okay.`)
    .setColor(+process.env.COLOR_NEUTRAL);
  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
