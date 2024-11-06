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
  .setName("view_server_whitelist")
  .setDescription("displays all whitelisted servers")
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

  const serverIds = wl.getWhitelistedServerIds();
  const lines = [];
  let currentServerWhitelisted = false;
  for (const serverId of serverIds) {
    const guild = await client.guilds.fetch(serverId).catch((err) => null);
    if (guild) {
      if (serverId == interaction.guild.id) {
        lines.push(`**${guild.name} (this server)**`);
        currentServerWhitelisted = true;
      } else {
        lines.push(guild.name);
      }
    }
  }
  const description =
    lines.join("\n") +
    (currentServerWhitelisted ? "" : "\n\nThis server is not whitelisted.");

  let embed;
  if (lines && lines.length > 0) {
    embed = new EmbedBuilder()
      .setTitle("Whitelisted servers!")
      .setDescription(description)
      .setColor(+process.env.COLOR_INFO);
  } else {
    embed = new EmbedBuilder()
      .setTitle("No servers are whitelisted!")
      .setDescription("The whitelist is empty.")
      .setColor(+process.env.COLOR_ERROR);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
