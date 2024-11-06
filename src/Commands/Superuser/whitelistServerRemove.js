/**
 * A secret command for removing servers from the whitelist.
 *
 * @file   This files defines the whiteServerRemove command module.
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
  .setName("unwhitelist_server")
  .setDescription("remove a given server from the whitelist")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("server_id")
      .setDescription(
        "the ID of the server to disallow users to interact with me in (if unset, remove the current server)"
      )
  );

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

  const serverId = interaction.options.getString("server_id");
  let embed;

  // Server is specified
  if (serverId) {
    // Not whitelisted (error)
    if (!wl.isServerWhitelisted(serverId)) {
      embed = new EmbedBuilder()
        .setTitle("Server is not whitelisted!")
        .setDescription(
          `The server with ID \`${serverId}\` is not on the whitelist.`
        )
        .setColor(+process.env.COLOR_ERROR);
    }
    // Remove the server from the whitelist (success)
    else {
      embed = new EmbedBuilder()
        .setTitle("Server removed!")
        .setDescription(
          `The server with ID \`${serverId}\` has been removed from the whitelist.`
        )
        .setColor(+process.env.COLOR_INFO);
      wl.removeServer(serverId);
      wl.saveWhitelist();
    }
  }
  // Server is not specified (use the server the command was sent from)
  else {
    const currentServerId = interaction.guild.id;

    // Already whitelisted (error)
    if (!wl.isServerWhitelisted(currentServerId)) {
      embed = new EmbedBuilder()
        .setTitle("Server is not whitelisted!")
        .setDescription(`This server is not on the whitelist.`)
        .setColor(+process.env.COLOR_ERROR);
    }
    // Add this server to the whitelist (success)
    else {
      embed = new EmbedBuilder()
        .setTitle("Server removed!")
        .setDescription(`This server has been removed from the whitelist.`)
        .setColor(+process.env.COLOR_INFO);
      wl.removeServer(currentServerId);
      wl.saveWhitelist();
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
