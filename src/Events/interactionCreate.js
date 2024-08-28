/**
 * A module for responding to interactions sent in servers containing this bot.
 *
 * @file   This files defines the interaction-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

export default async function execute(interaction) {
  const { client, commandName } = interaction;
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    command.execute(interaction, client);
  } catch (err) {
    console.log(err);
  }
}
