/**
 * A command for viewing card sets.
 *
 * @file   This files defines the view_set command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { normalise, truncate } from "../../Utility/text.js";
import {
  fetchCardSetPrintings,
  getAllCardSets,
  getCardCycle,
  getCardSet,
} from "../../Netrunner/api.js";
import { factionToName, factionToEmote } from "../../Netrunner/discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_set")
  .setDescription("displays the cards in a specific Netrunner set")
  .addStringOption((option) =>
    option
      .setName("set_name")
      .setDescription("the set to view")
      .setAutocomplete(true)
      .setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const cardSetId = interaction.options.getString("set_name");
  const cardSet = getCardSet(cardSetId);

  if (!cardSet) {
    const embed = new EmbedBuilder()
      .setTitle("Unknown Set!")
      .setDescription(`"${cardSetId}" does not match any known set.`)
      .setColor(+process.env.COLOR_ERROR);

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // Determine the type of the set
  let setType, fromCycle;
  switch (cardSet.attributes.card_set_type_id) {
    case "booster_pack":
      setType = "booster pack";
      fromCycle = true;
      break;
    case "campaign":
      setType = "campaign expansion";
      break;
    case "core":
      setType = "core set";
      break;
    case "data_pack":
      setType =
        cardSet.attributes.released_by == "null_signal_games"
          ? "set"
          : "data pack";
      fromCycle = true;
      break;
    case "deluxe":
      setType = "deluxe expansion";
      break;
    case "draft":
      setType = "draft set";
      break;
    case "expansion":
      setType = "expanion";
      break;
    case "promo":
      setType = "promotional pack";
      break;
    default:
      setType = "set";
  }

  const cycleDescription = fromCycle
    ? ` from the ${
        getCardCycle(cardSet.attributes.card_cycle_id).attributes.name
      } cycle`
    : "";

  const briefText = `${cardSet.attributes.name} is a ${setType}${cycleDescription}.`;

  // Get the list of printings in the set and format them into lines
  // We assume that the cards are already grouped by faction
  const printings = await fetchCardSetPrintings(cardSet.id);
  const printingLines = [];
  let faction = null;
  printings
    .sort((a, b) => a.attributes.position - b.attributes.position)
    .forEach((printing) => {
      if (printing.attributes.faction_id != faction) {
        faction = printing.attributes.faction_id;
        printingLines.push(
          `**${factionToEmote(faction)} ${factionToName(faction)}**`
        );
      }
      printingLines.push(truncate(printing.attributes.title, 16, "…"));
    });

  const fields = [];
  for (let i = 0; i < printingLines.length; i += 10) {
    const column = printingLines.slice(i, i + 10).join("\n");
    fields.push({
      name: "_ _",
      value: column,
      inline: true,
    });
  }

  // Construct embed
  const releaseText = `**Release date:** ${cardSet.attributes.date_release}`;
  const sizeText = `**Size:** ${cardSet.attributes.size} card${
    cardSet.attributes.size == 1 ? "" : "s"
  }`;

  const descriptionText = `${briefText}\n\n${releaseText}\n${sizeText}`;

  const embed = new EmbedBuilder()
    .setTitle(":dividers:  " + cardSet.attributes.name)
    .setURL(`${process.env.NRDB_URL}en/set/${cardSet.attributes.legacy_code}`)
    .setDescription(descriptionText)
    .setColor(+process.env.COLOR_INFO)
    .addFields(fields);

  await interaction.deferReply({});
  await interaction.editReply({ embeds: [embed] });
}

async function autocomplete(interaction, client) {
  const focusedValue = normalise(interaction.options.getFocused()).trim();
  const validChoices =
    focusedValue == ""
      ? Object.values(getAllCardSets())
          .slice(0, 25)
          .map((cardSet) => ({
            name: cardSet.attributes.name,
            value: cardSet.id,
          }))
      : Object.values(getAllCardSets())
          .filter((cardSet) =>
            normalise(cardSet.attributes.name).startsWith(focusedValue)
          )
          .slice(0, 25)
          .map((cardSet) => ({
            name: cardSet.attributes.name,
            value: cardSet.id,
          }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
