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
  .setName("accept")
  .setDescription("accept the job");

const meta = {
  hideFromHelp: true,
};

async function execute(interaction, client) {
  await interaction.reply("https://sahasra.run");
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
