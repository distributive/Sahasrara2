/**
 * A command for displaying the basic action cards.
 *
 * @file   This files defines the basicAction command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { SlashCommandBuilder } from "discord.js";
import { createBasicActionEmbed } from "../Netrunner/basicActions.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("basic_actions")
  .setDescription("displays the basic action cards")
  .addStringOption((option) =>
    option
      .setName("side")
      .setDescription("whether to display the Corp or Runner basic action card")
      .setRequired(true)
      .setChoices([
        { name: "Corp", value: "corp" },
        { name: "Runner", value: "runner" },
      ])
  )
  .addBooleanOption((option) =>
    option
      .setName("image_only")
      .setDescription("whether to display the basic action card without text")
  );

const meta = {};

async function execute(interaction, client) {
  const isCorp = interaction.options.getString("side") == "corp";
  const displayText = !interaction.options.getBoolean("image_only");
  const embed = createBasicActionEmbed(isCorp, displayText);
  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
