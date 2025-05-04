/**
 * A command for viewing card cycles.
 *
 * @file   This files defines the view_cycle command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { normalise } from "../../Utility/text.js";
import {
  getAllCardCycles,
  getCardCycle,
  getCardSet,
} from "../../Netrunner/api.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_cycle")
  .setDescription("view a specific cycle")
  .addStringOption((option) =>
    option
      .setName("cycle_name")
      .setDescription("the cycle to view")
      .setAutocomplete(true)
      .setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const cardCycleId = interaction.options.getString("cycle_name");
  const cardCycle = getCardCycle(cardCycleId);

  if (!cardCycle) {
    const embed = new EmbedBuilder()
      .setTitle("Unknown Cycle!")
      .setDescription(`"${cardCycleId}" does not match any known cycle.`)
      .setColor(+process.env.COLOR_ERROR);

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // Get the list of sets in the cycle and format them into lines
  const cardSets = cardCycle.attributes.card_set_ids.map((cardSetId) => {
    const cardSet = getCardSet(cardSetId);
    return `- [${cardSet.attributes.name}](${process.env.NRDB_URL}en/set/${cardSet.attributes.legacy_code})`;
  });
  const descriptionText = `**Release date:** ${
    cardCycle.attributes.date_release
  }\n**Size:** ${cardSets.length}\n${cardSets.join("\n")}`;

  // Construct embed
  const embed = new EmbedBuilder()
    .setTitle(":recycle:  " + cardCycle.attributes.name)
    .setURL(
      `${process.env.NRDB_URL}en/cycle/${cardCycle.attributes.legacy_code}`
    )
    .setDescription(descriptionText)
    .setColor(+process.env.COLOR_INFO);

  await interaction.deferReply({});
  await interaction.editReply({ embeds: [embed] });
}

async function autocomplete(interaction, client) {
  const focusedValue = normalise(interaction.options.getFocused()).trim();
  const validChoices =
    focusedValue == ""
      ? Object.values(getAllCardCycles())
          .filter((cardCycle) => cardCycle.attributes.card_set_ids.length > 1)
          .slice(0, 25)
          .map((cardCycle) => ({
            name: cardCycle.attributes.name,
            value: cardCycle.id,
          }))
      : Object.values(getAllCardCycles())
          .filter(
            (cardCycle) =>
              cardCycle.attributes.card_set_ids.length > 1 &&
              normalise(cardCycle.attributes.name).startsWith(focusedValue)
          )
          .slice(0, 25)
          .map((cardCycle) => ({
            name: cardCycle.attributes.name,
            value: cardCycle.id,
          }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
