/**
 * A secret command for viewing the server whitelist.
 *
 * @file   This files defines the whitelistServerView command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import * as wl from "../../Permissions/serverWhitelist.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("clear_whitelist")
  .setDescription("removes all whitelisted servers")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const meta = {
  hideFromHelp: true,
  ignoreWhitelist: true,
};

async function execute(interaction, client) {
  // Verify superuser status - TODO: create permissions module
  if (interaction.user.id != process.env.SUPER_USER) {
    const embed = new EmbedBuilder()
      .setTitle("Invalid permissions!")
      .setDescription(
        `You do not have permission to use this command, but you are seeing it because Discord does not allow any commands to be hidden from admnistrators.`
      )
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  let embed;
  if (wl.getWhitelistedServerIds().length) {
    wl.clear();
    embed = new EmbedBuilder()
      .setTitle("Whitelist cleared!")
      .setDescription("There are now no servers on the whitelist.")
      .setColor(+process.env.COLOR_INFO);
  } else {
    embed = new EmbedBuilder()
      .setTitle("No servers are whitelisted!")
      .setDescription("The whitelist is already empty.")
      .setColor(+process.env.COLOR_ERROR);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
