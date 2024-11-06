/**
 * A module for responding to interactions sent in servers containing this bot.
 *
 * @file   This files defines the interaction-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { readBool } from "../Utility/env.js";
import * as wl from "../Permissions/serverWhitelist.js";

///////////////////////////////////////////////////////////////////////////////

export default async function execute(interaction) {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const { client, commandName } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      console.error(`The slash command "${commandName}" was not found.`);
      return;
    }

    // If the whitelist is active, and we're in a server, check the server is whitelisted
    if (
      !command.meta.ignoreWhitelist &&
      interaction.guildId &&
      readBool("WHITELIST_SERVERS") &&
      !wl.isServerWhitelisted(interaction.guildId)
    ) {
      return;
    }

    // If the message was posted in a DM, check DMs are enabled
    if (!interaction.guildId && !readBool("ALLOW_DIRECT_MESSAGES")) {
      return;
    }

    try {
      command.execute(interaction, client);
    } catch (err) {
      console.error("===================");
      console.error("Slash command error");
      console.error("===================");
      console.error(err);
    }
  }

  // Autocomplete slash commands
  else if (interaction.isAutocomplete()) {
    const { client, commandName } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      console.error(`The autocomplete command "${commandName}" was not found.`);
    }

    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      console.error("==================");
      console.error("Autocomplete error");
      console.error("==================");
      console.error(error);
    }
  }
}
