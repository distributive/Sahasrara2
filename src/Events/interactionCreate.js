/**
 * A module for responding to interactions sent in servers containing this bot.
 *
 * @file   This files defines the interaction-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import * as wl from "../Permissions/serverWhitelist.js";
import { readBool } from "../Utility/env.js";
import { logError } from "../Utility/error.js";

///////////////////////////////////////////////////////////////////////////////

export default async function execute(interaction) {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const { client, commandName } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      logError(new Error(`The slash command "${commandName}" was not found.`));
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
      logError(err); // Slash command error
    }
  }

  // Autocomplete slash commands
  else if (interaction.isAutocomplete()) {
    const { client, commandName } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      logError(
        new Error(`The autocomplete command "${commandName}" was not found.`)
      );
    }

    try {
      await command.autocomplete(interaction, client);
    } catch (err) {
      logError(err); // Autocomplete error
    }
  }
}
