/**
 * A module for building ONR-based Discord embeds.
 *
 * @file   This files defines the ONR/embed module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import { getCardImage } from "./api.js";
import { rarityToColor, formatText } from "./discord.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} card An ONR card.
 * @return {Object} A Discord embed displaying the title, game text, stats, and image of that card.
 */
function createCardEmbed(card) {
  return new EmbedBuilder()
    .setColor(rarityToColor(card.rarity))
    .setTitle(card.title)
    .setDescription(cardToEmbedBody(card))
    .setThumbnail(getCardImage(card))
    .setFooter({ text: cardToFooter(card) });
}

/**
 * @param {Object} card An ONR card.
 * @return {Object} A Discord embed displaying the title and image of that card.
 */
function createCardImageEmbed(card) {
  return new EmbedBuilder()
    .setColor(rarityToColor(card.rarity))
    .setTitle(card.title)
    .setImage(getCardImage(card));
}

/**
 * @param {Object} card An ONR card.
 * @return {Object} A Discord embed displaying the title and flavour text of that card (if any).
 */
function createCardFlavourEmbed(card) {
  let flavourText = card.flavor ? card.flavor : "`Card has no flavour text.`";
  return new EmbedBuilder()
    .setColor(rarityToColor(card.rarity))
    .setTitle(card.title)
    .setDescription(flavourText)
    .setThumbnail(getCardImage(card));
}

///////////////////////////////////////////////////////////////////////////////
// PRIVATE

/**
 * @param {Object} card An ONR card.
 * @return {string} A multiline string containing the stats and game text of the printing.
 */
function cardToEmbedBody(card) {
  let type = card.type;
  if (card.subtypes) {
    type += `: ${card.subtypes}`;
  }

  let stats = "";
  if (card.cost != null) {
    stats += " • ";
    stats +=
      card.side_code != "corp" || card.card_type_id == "operation"
        ? "Cost: "
        : "Rez: ";
    stats += card.cost;
  }
  if (card.strength != null) {
    stats += ` • Strength: ${card.strength}`;
  }
  if (card.trash_cost != null) {
    stats += ` • Trash: ${card.cost}`;
  }
  if (card.type_code == "agenda") {
    stats += ` • (${card.advancement_requirement}/${card.agenda_points})`;
  }
  if (card.memory_cost != null) {
    stats += ` • MU: ${card.memory_cost}`;
  }

  let header = `**${type}${stats}**`;
  let body = formatText(card.text);

  return header + "\n" + body;
}

/**
 * @param {Object} card An ONR card.
 * @return {string} A single line containing the set and rarity of that card.
 */
function cardToFooter(card) {
  return `${card.set} • ${card.rarity}`;
}

///////////////////////////////////////////////////////////////////////////////

export default {
  createCardEmbed,
  createCardImageEmbed,
  createCardFlavourEmbed,
};
