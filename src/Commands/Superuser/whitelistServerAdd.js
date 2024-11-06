/**
 * A secret command for whitelisting servers.
 *
 * @file   This files defines the whitelistServerAdd command module.
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
  .setName("whitelist_server")
  .setDescription("whitelist a given server")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("server_id")
      .setDescription(
        "the ID of the server to allow users to interact with me in (if unset, whitelist the current server)"
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
    // Already whitelisted (error)
    if (wl.isServerWhitelisted(serverId)) {
      embed = new EmbedBuilder()
        .setTitle("Server already whitelisted!")
        .setDescription(
          `The server with ID \`${serverId}\` is already on the whitelist.`
        )
        .setColor(+process.env.COLOR_ERROR);
    }
    // Bot is not in that server (error)
    else if (!client.guilds.cache.some((guild) => guild.id == serverId)) {
      embed = new EmbedBuilder()
        .setTitle("Invalid server!")
        .setDescription(`I am not in a server with ID \`${serverId}\`.`)
        .setColor(+process.env.COLOR_ERROR);
    }
    // Add the server to the whitelist (success)
    else {
      embed = new EmbedBuilder()
        .setTitle("Server whitelisted!")
        .setDescription(
          `The server with ID \`${serverId}\` has been added to the whitelist.`
        )
        .setColor(+process.env.COLOR_INFO);
      wl.addServer(serverId);
      wl.saveWhitelist();
    }
  }
  // Server is not specified (use the server the command was sent from)
  else {
    const currentServerId = interaction.guild.id;

    // Already whitelisted (error)
    if (wl.isServerWhitelisted(currentServerId)) {
      embed = new EmbedBuilder()
        .setTitle("Server already whitelisted!")
        .setDescription(`This server is already on the whitelist.`)
        .setColor(+process.env.COLOR_ERROR);
    }
    // Add this server to the whitelist (success)
    else {
      embed = new EmbedBuilder()
        .setTitle("Server whitelisted!")
        .setDescription(`This server has been added to the whitelist.`)
        .setColor(+process.env.COLOR_INFO);
      wl.addServer(currentServerId);
      wl.saveWhitelist();
    }
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
