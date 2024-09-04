/**
 * A command for viewing user documentation for the bot.
 *
 * @file   This files defines the help command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { normalise } from "../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("shows information about a specific command")
  .addStringOption((option) =>
    option
      .setName("command_name")
      .setDescription("the command to display info on")
      .setAutocomplete(true)
  );

const meta = {};

async function execute(interaction, client) {
  const commandName = interaction.options.getString("command_name");
  let titleText,
    descriptionText,
    color = +process.env.COLOR_INFO;

  if (commandName) {
    const command = client.commands.get(commandName);
    if (command && !command.data.hideFromHelp) {
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
      if (!command.meta.hideFromHelp) {
        descriptionText += `\n\`${command.data.name}\` ${command.data.description}`;
      }
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(`:scroll:  ${titleText}`)
    .setDescription(descriptionText)
    .setColor(color);

  await interaction.reply({ embeds: [embed] });
}

async function autocomplete(interaction, client) {
  const focusedValue = normalise(interaction.options.getFocused());
  const validChoices = client.commands
    .filter(
      (command) =>
        !command.meta.hideFromHelp &&
        normalise(command.data.name).startsWith(focusedValue)
    )
    .map((command) => ({ name: command.data.name, value: command.data.name }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
