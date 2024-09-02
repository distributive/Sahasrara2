/**
 * A module for responding to interactions sent in servers containing this bot.
 *
 * @file   This files defines the interaction-response module.
 * @since  1.0.0
 */

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
