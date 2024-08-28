/**
 * A module for building Netrunner-based Discord embeds.
 *
 * @file   This files defines the Netrunner/embed module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import { getCardType, getFaction } from "./api.js";
import { factionToColor, factionToImage, formatText } from "./discord.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying the title, game text, stats, and image of the card/printing.
 */
function createPrintingEmbed(printing) {
  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(printingToEmbedBody(printing))
    .setThumbnail(printing.attributes.images.nrdb_classic.medium)
    .setFooter({
      text: printingToFooter(printing),
      iconURL: factionToImage(printing.attributes.faction_id),
    });
}

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying the title and image of the printing.
 */
function createPrintingImageEmbed(printing) {
  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setImage(printing.attributes.images.nrdb_classic.large);
}

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying the title and flavour text of the printing (if any).
 */
function createPrintingFlavourEmbed(printing) {
  let flavourText = printing.attributes.flavor
    ? printing.attributes.flavor
    : "`Card has no flavour text.`";
  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}card/${printing.id}`)
    .setDescription(flavourText)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium);
}

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying banlist history of the card.
 */
function createPrintingBanlistEmbed(printing) {
  return {}; // TODO
}

/**
 * @param {Object} card A Netrunner card.
 * @param {Object} printing The most recent printing of that card.
 * @return {Object} A Discord embed notifying the user that they have attempted to get a non-existent printing of the card.
 */
function createPrintingIndexOutOfBoundsEmbed(card, printing) {
  const length = card.attributes.printing_ids.length;
  const error = `\`Index out of bounds! ${
    card.attributes.title
  } has ${length} printing${length != 1 ? "s" : ""}.\``; // TODO: add error module
  return new EmbedBuilder()
    .setColor(0xff0000) // TODO: add color module
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}card/${printing.id}`)
    .setDescription(error)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium);
}

/**
 * TODO: move to a generic embed module.
 *
 * @return {Object} A Discord embed notifying the user that this bot no longer uses plaintext commands.
 */
function createDeprecationEmbed() {
  const message =
    "I now use slash commands! To see the new help menu, try `/help`!";
  return new EmbedBuilder()
    .setColor(factionToColor(+process.env.COLOR_ERROR))
    .setTitle("$ commands deprecated!")
    .setDescription(message);
}

///////////////////////////////////////////////////////////////////////////////
// PRIVATE

/**
 * @param {Object} printing A card printing (although a card object will also work).
 * @return {string} The title of the card with a uniqueness icon prepended as necessary.
 */
function printingToTitle(printing) {
  return (
    (printing.attributes.is_unique ? "♦ " : "") + printing.attributes.title
  );
}

/**
 * @param {Object} printing A card printing (although a card object will also work).
 * @return {string} A multiline string containing the stats and game text of the printing.
 */
function printingToEmbedBody(printing) {
  let type = getCardType(printing.attributes.card_type_id).attributes.name;
  if (printing.attributes.display_subtypes) {
    type += `: ${printing.attributes.display_subtypes}`;
  }

  let stats = "";
  if (printing.attributes.cost != null) {
    stats += " • ";
    stats +=
      printing.attributes.side_id != "corp" ||
      printing.attributes.card_type_id == "operation"
        ? "Cost: "
        : "Rez: ";
    stats += printing.attributes.cost;
  }
  if (printing.attributes.strength != null) {
    stats += ` • Strength: ${printing.attributes.strength}`;
  }
  if (printing.attributes.trash_cost != null) {
    stats += ` • Trash: ${printing.attributes.cost}`;
  }
  if (printing.attributes.card_type_id == "agenda") {
    stats += ` • (${printing.attributes.advancement_requirement}/${printing.attributes.agenda_points})`;
  }
  if (
    printing.attributes.card_type_id == "corp_identity" ||
    printing.attributes.card_type_id == "runner_identity"
  ) {
    stats += ` • (${printing.attributes.minimum_deck_size}/${printing.attributes.influence_limit})`;
  }
  if (printing.attributes.base_link != null) {
    stats += ` • Link: ${printing.attributes.base_link}`;
  }
  if (printing.attributes.memory_cost != null) {
    stats += ` • MU: ${printing.attributes.memory_cost}`;
  }

  let influence = "";
  if (printing.attributes.influence_cost) {
    influence = ` • Influence: ${"●".repeat(
      printing.attributes.influence_cost
    )}`;
  } else if (printing.attributes.influence_cost == 0) {
    influence = ` • Influence: –`;
  }

  let header = `**${type}${stats}${influence}**`;
  let body = formatText(printing.attributes.text);

  return header + "\n" + body;
}

/**
 * @param {Object} printing A card printing.
 * @return {string} A single line containing the faction, cycle, set, legality, and printed position of the printing.
 */
function printingToFooter(printing) {
  // TODO: add banned/rotated status
  return `${getFaction(printing.attributes.faction_id).attributes.name} • ${
    printing.attributes.card_cycle_name
  } • ${printing.attributes.card_set_name} #${printing.attributes.position}`;
}

///////////////////////////////////////////////////////////////////////////////

export {
  createPrintingEmbed,
  createPrintingImageEmbed,
  createPrintingFlavourEmbed,
  createPrintingBanlistEmbed,
  createPrintingIndexOutOfBoundsEmbed,
  createDeprecationEmbed,
};
