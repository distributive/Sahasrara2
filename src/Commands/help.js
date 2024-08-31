/**
 * A command for viewing user documentation for the bot.
 *
 * @file   This files defines the help function module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = {
  name: "help",
  description: "shows information about a specific command",
  dm_permissions: "0",
  options: [
    {
      name: "command_name",
      description: "the command to display info on",
      type: 3,
      required: false,
    },
  ],
};
async function execute(interaction, client) {
  const commandName = interaction.options.getString("command_name");
  let titleText,
    descriptionText,
    color = +process.env.COLOR_INFO;

  if (commandName) {
    const command = client.commands.get(commandName);
    if (command) {
      titleText = `\`${command.data.name}\``;
      descriptionText = command.data.longDescription
        ? command.data.longDescription
        : command.data.description;
    } else {
      titleText = "Unknown command";
      descriptionText =
        "No command exists with that name! Try `\\help` for a full list of commands.";
      color = +process.env.COLOR_ERROR;
    }
  } else {
    titleText = "Sahasrara";
    descriptionText = `
        A Discord Netrunner bot.

        **Searching for Netrunner cards**
        \`[[card]]\` to view a card
        \`{{card}}\` to view its art
        \`<<card>>\` to view its flavour text
        \`((card))\` to view its legality history

        **Additional parameters**
        \`[[card|set]]\` to view the printing of a card from a named set
        \`[[card|n]]\` to view the nth printing of a card (0 is the first, -1 is the last)

        **Searching for Original Netrunner cards**
        \`[|card|]\` to view an ONR card
        \`{|card|}\` to view its art
        \`<|card|>\` to view its flavour text

        **Commands**`;

    client.commands.forEach((command) => {
      descriptionText += `\n\`${command.data.name}\` ${command.data.description}`;
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(`:scroll:  ${titleText}`)
    .setDescription(descriptionText)
    .setColor(color);

  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, execute };
