/**
 * A module for building Netrunner-based Discord embeds.
 *
 * @file   This files defines the Netrunner/embed module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import * as api from "./api.js";
import {
  factionToColor,
  factionToImage,
  formatText,
  legalityToSymbol,
} from "./discord.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying the title, game text, stats, and image of the card/printing.
 */
export function createPrintingEmbed(printing) {
  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(printingToEmbedBody(printing))
    .setThumbnail(printing.attributes.images.nrdb_classic.large)
    .setFooter({
      text: printingToFooter(printing),
      iconURL: factionToImage(printing.attributes.faction_id),
    });
}

/**
 * @param {Object} printing A card printing.
 * @return {Object} A Discord embed displaying the title and image of the printing.
 */
export function createPrintingImageEmbed(printing) {
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
export function createPrintingFlavourEmbed(printing) {
  let flavourText = printing.attributes.flavor
    ? printing.attributes.flavor
    : "`Card has no flavour text.`";
  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(flavourText)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium);
}

/**
 * @param {Object} printing A card printing.
 * @param {string=} format A format (optional - default is Standard).
 * @return {Object} A Discord embed displaying banlist history of the card.
 */
export function createPrintingBanlistEmbed(printing, formatId) {
  if (!formatId) {
    formatId = "standard";
  }

  // Get all snapshots in the format
  const snapshots = api.getFormatSnapshots(formatId);

  // Group snapshots by restriction ID
  let restrictionToSnapshots = {};
  snapshots.forEach((snapshot) => {
    if (!snapshot.attributes.restriction_id) {
      return; // Ignore null restriction IDs - they mean there was no restriction that snapshot
    }
    if (restrictionToSnapshots[snapshot.attributes.restriction_id]) {
      restrictionToSnapshots[snapshot.attributes.restriction_id].push(snapshot);
    } else {
      restrictionToSnapshots[snapshot.attributes.restriction_id] = [snapshot];
    }
  });

  // Map each restriction ID to the data we need
  let hasBeenInPool = false;
  const rows = Object.keys(restrictionToSnapshots).map((restrictionId) => {
    const restriction = api.getRestriction(restrictionId);
    const isCardInPool = restrictionToSnapshots[restrictionId].some(
      (snapshot) =>
        api
          .getCardPool(snapshot.attributes.card_pool_id)
          .attributes.card_ids.includes(printing.attributes.card_id)
    );
    if (isCardInPool) {
      hasBeenInPool = true;
    }
    const legality = isCardInPool
      ? api.getLegalityUnderRestriction(
          printing.attributes.card_id,
          restriction
        )
      : hasBeenInPool
      ? "rotated"
      : "unreleased";
    return [legalityToSymbol(legality), restriction.attributes.name];
  });

  // Simplify sequences of restrictions where the legality was unchanged for more than 3 restrictions
  let simplifiedRows = [];
  let i;
  for (i = 0; i < rows.length; ) {
    const row = rows[i];
    simplifiedRows.push(row);
    let j;
    for (j = i + 1; j < rows.length && rows[j][0] == row[0]; j++) {}
    if (j - i > 3) {
      simplifiedRows.push([
        row[0],
        `_unchanged ${j - i - 2} update${j - i - 2 != 1 ? "s" : ""}_`,
      ]);
      simplifiedRows.push(rows[j - 1]);
    } else {
      for (let k = i + 1; k < j; k++) {
        simplifiedRows.push(rows[k]);
      }
    }
    i = j;
  }

  // Convert the rows to strings and concatenate them
  const restrictionHistory = simplifiedRows
    .map((row) => `${row[0]} ${row[1]}`)
    .reverse()
    .join("\n");

  return new EmbedBuilder()
    .setColor(factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(restrictionHistory)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium);
}

/**
 * @param {Object} card A Netrunner card.
 * @param {Object} printing The most recent printing of that card.
 * @return {Object} A Discord embed notifying the user that they have attempted to get a non-existent printing of the card.
 */
export function createPrintingIndexOutOfBoundsEmbed(card, printing) {
  const length = card.attributes.printing_ids.length;
  const error = `\`Index out of bounds! ${
    card.attributes.title
  } has ${length} printing${length != 1 ? "s" : ""}.\``; // TODO: add error module
  return new EmbedBuilder()
    .setColor(+process.env.COLOR_ERROR)
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(error)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium);
}

/**
 * TODO: move to a generic embed module.
 *
 * @return {Object} A Discord embed notifying the user that this bot no longer uses plaintext commands.
 */
export function createDeprecationEmbed() {
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
  let type = api.getCardType(printing.attributes.card_type_id).attributes.name;
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
    stats += ` • Trash: ${printing.attributes.trash_cost}`;
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
  const isInPool = api.isCardInCardPool(
    printing.attributes.card_id,
    api.getActiveCardPool("standard")
  );
  const isBanned = isInPool
    ? api.getLegalityUnderRestriction(
        printing.attributes.card_id,
        api.getActiveRestriction("standard")
      ) == "banned"
    : false;
  const faction = api.getFaction(printing.attributes.faction_id).attributes
    .name;
  const cycle = printing.attributes.card_cycle_name;
  const set = printing.attributes.card_set_name;
  const cycleSet = cycle == set ? cycle : `${cycle} • ${set}`;
  const legality = isInPool ? (isBanned ? " (banned)" : "") : " (rotated)";
  const position = printing.attributes.position;
  return `${faction} • ${cycleSet}${legality} #${position}`;
}
