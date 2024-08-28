/**
 * A module for responding to messages sent in servers containing this bot.
 *
 * @file   This files defines the message-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { getClosestCard, fetchPrinting } from "./../Netrunner/api.js";
import {
  createPrintingIndexOutOfBoundsEmbed,
  createPrintingEmbed,
  createPrintingImageEmbed,
  createPrintingFlavourEmbed,
  createPrintingBanlistEmbed,
  createDeprecationEmbed,
} from "./../Netrunner/embed.js";
import { getClosestCard as _getClosestCard } from "./../ONR/api.js";
import {
  createCardEmbed,
  createCardImageEmbed,
  createCardFlavourEmbed,
} from "./../ONR/embed.js";

///////////////////////////////////////////////////////////////////////////////

export default async function execute(message) {
  const { author, content } = message;

  // Ignore bot/empty messages
  if (author.bot || !content) {
    return;
  }

  if (content.toLowerCase().substring(0, 5) == "$help") {
    sendDeprecationWarning(message);
  } else {
    parseInlineCommands(message);
  }
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Parses a Discord message for inline commands and generates responses.
 *
 * @param {Object} message A Discord message.
 */
async function parseInlineCommands(message) {
  const { client, content } = message;

  const filteredContent = content.replace(/(?<!\\)```[\s\S]*?```/g, ""); // Ignore code blocks
  const regex =
    /\[\[.*?\]\]|\{\{.*?\}\}|<<.*?>>|\(\(.*?\)\)|\[\|.*?\|\]|\{\|.*?\|\}|<\|.*?\|>/g; // Find inline commands
  const matches = filteredContent.match(regex);

  // Ignore messages with no commands
  if (!matches) {
    return;
  }

  const channel = client.channels.cache.get(message.channelId);

  // Parse each command
  for (const match of matches) {
    const rawInput = match.substring(2, match.length - 2).trim();

    // Ignore empty inputs
    if (!rawInput) {
      return;
    }

    // Separate commands into modern Netrunner and Original Netrunner (ONR)
    if (match[1] != "|") {
      await parseNetrunnerCard(match, rawInput, channel);
    } else {
      parseOnrCard(match, rawInput, channel);
    }
  }
}

/**
 * Parses an inline command requesting a Netrunner card and generates a respose.
 *
 * @param {string} match The full inline command matched (includes brackets).
 * @param {string} rawInput The unedited contents of the command (excludes brackets).
 * @param {Object} channel The Discord channel to send the response to.
 */
async function parseNetrunnerCard(match, rawInput, channel) {
  // Separate command data
  const inputs = rawInput.split("|");
  let query, index;
  if (inputs.length > 1) {
    query = inputs.slice(0, -1).join("|");
    index = +inputs[inputs.length - 1];
  } else {
    query = rawInput;
    index = -1;
  }

  // If index is not a number, default to -1 (TODO: allow set/cycle names as indices)
  if (isNaN(index)) {
    index = -1;
  }

  const card = await getClosestCard(query);
  if (index < 0) {
    index += card.attributes.printing_ids.length;
  }
  index = card.attributes.printing_ids.length - index - 1;

  // Check index is valid
  if (index < 0 || index >= card.attributes.printing_ids.length) {
    const printing = await fetchPrinting(card.attributes.latest_printing_id);
    const errorEmbed = createPrintingIndexOutOfBoundsEmbed(card, printing);
    channel.send({ embeds: [errorEmbed] });
    return;
  }

  // Get the indexed printing
  const printing = await fetchPrinting(card.attributes.printing_ids[index]);

  // Create and send embed
  const outEmbed =
    match[0] == "["
      ? createPrintingEmbed(printing)
      : match[0] == "{"
      ? createPrintingImageEmbed(printing)
      : match[0] == "<"
      ? createPrintingFlavourEmbed(printing)
      : createPrintingBanlistEmbed(printing);
  channel.send({ embeds: [outEmbed] });
}

/**
 * Parses an inline command requesting an ONR card and generates a respose.
 *
 * @param {string} match The full inline command matched (includes brackets).
 * @param {string} rawInput The unedited contents of the command (excludes brackets).
 * @param {Object} channel The Discord channel to send the response to.
 */
function parseOnrCard(match, rawInput, channel) {
  const card = _getClosestCard(rawInput);
  const outEmbed =
    match[0] == "["
      ? createCardEmbed(card)
      : match[0] == "{"
      ? createCardImageEmbed(card)
      : createCardFlavourEmbed(card);
  channel.send({ embeds: [outEmbed] });
}

/**
 * Sends a user a warning that plaintext commands (i.e. prefixed commands instead of slash commands) are no longer supported.
 *
 * @param {Object} message The message that triggered this warning.
 */
function sendDeprecationWarning(message) {
  const channel = message.client.channels.cache.get(message.channelId);
  const outEmbed = createDeprecationEmbed();
  channel.send({ embeds: [outEmbed] });
}
