/**
 * A module for responding to messages sent in servers containing this bot.
 *
 * @file   This files defines the message-response module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { applyAlias } from "../Netrunner/aliases.js";
import { getClosestCard, fetchPrinting } from "./../Netrunner/api.js";
import {
  createPrintingIndexOutOfBoundsEmbed,
  createPrintingEmbed,
  createPrintingImageEmbed,
  createPrintingFlavourEmbed,
  createPrintingBanlistEmbed,
  createDeprecationEmbed,
} from "./../Netrunner/embed.js";
import { getClosestCard as getClosestOnrCard } from "./../ONR/api.js";
import {
  createCardEmbed,
  createCardImageEmbed,
  createCardFlavourEmbed,
} from "./../ONR/embed.js";

///////////////////////////////////////////////////////////////////////////////

import { readBool } from "../Utility/env.js";
import { logError } from "../Utility/error.js";
import * as wl from "../Permissions/serverWhitelist.js";

///////////////////////////////////////////////////////////////////////////////

export default async function execute(message) {
  const { author, content } = message;

  // Ignore bot/empty messages
  if (author.bot || !content) {
    return;
  }

  // If the whitelist is active, and we're in a server, check the server is whitelisted
  if (
    message.guildId &&
    readBool("WHITELIST_SERVERS") &&
    !wl.isServerWhitelisted(message.guildId)
  ) {
    return;
  }

  // If the message was posted in a DM, check DMs are enabled
  if (!message.guildId && !readBool("ALLOW_DIRECT_MESSAGES")) {
    return;
  }

  if (content.toLowerCase().substring(0, 5) == "$help") {
    sendDeprecationWarning(message);
  } else {
    parseInlineCommands(message).catch(logError);
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

  // Pass each parser a list to update with the card that gets fetched
  // If the card is already in the list, do not display it again
  let netrunnerCards = [];
  let onrCards = [];

  // Limit number of card embeds per message
  let countdown = process.env.RESULT_LIMIT;

  // Parse each command
  for (const match of matches) {
    if (countdown < 1) {
      return;
    }

    const rawInput = match.substring(2, match.length - 2).trim();

    // Ignore empty inputs
    if (!rawInput) {
      return;
    }

    // Separate commands into modern Netrunner and Original Netrunner (ONR)
    if (match[1] != "|") {
      const success = await parseNetrunnerCard(
        match,
        rawInput,
        channel,
        netrunnerCards
      );
      if (success) {
        countdown--;
      }
    } else {
      if (parseOnrCard(match, rawInput, channel, onrCards)) {
        countdown--;
      }
    }
  }
}

/**
 * Parses an inline command requesting a Netrunner card and generates a respose.
 *
 * @param {string} match The full inline command matched (includes brackets).
 * @param {string} rawInput The unedited contents of the command (excludes brackets).
 * @param {Object} channel The Discord channel to send the response to.
 * @param {string[]} previousCards An array of card IDs already parsed from this message to avoid reposting any. Must be updated within.
 * @return {bool} Whether a card embed was successfully sent.
 */
async function parseNetrunnerCard(match, rawInput, channel, previousCards) {
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
  if (isNaN(index) || !Number.isInteger(index)) {
    index = -1;
  }

  const card = await getClosestCard(applyAlias(query));

  // Ensure a card was found
  if (!card) {
    logError(new Error(`Card not found with query "${rawInput}"`));
    return false;
  }

  // Do not post more than one copy of each card per message
  if (previousCards.includes(card.id)) {
    return false;
  }
  previousCards.push(card.id);

  if (index < 0) {
    index += card.attributes.printing_ids.length;
  }
  index = card.attributes.printing_ids.length - index - 1;

  // Check index is valid
  if (index < 0 || index >= card.attributes.printing_ids.length) {
    const printing = await fetchPrinting(card.attributes.latest_printing_id);
    const errorEmbed = createPrintingIndexOutOfBoundsEmbed(card, printing);
    channel.send({ embeds: [errorEmbed] });
    return false;
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

  return true;
}

/**
 * Parses an inline command requesting an ONR card and generates a respose.
 *
 * @param {string} match The full inline command matched (includes brackets).
 * @param {string} rawInput The unedited contents of the command (excludes brackets).
 * @param {Object} channel The Discord channel to send the response to.
 * @param {string[]} previousCards An array of card IDs already parsed from this message to avoid reposting any. Must be updated within.
 * @return {bool} Whether a card embed was successfully sent.
 */
function parseOnrCard(match, rawInput, channel, previousCards) {
  const card = getClosestOnrCard(rawInput);

  // Do not post more than one copy of each card per message
  if (previousCards.includes(card.id)) {
    return false;
  }
  previousCards.push(card.id);

  const outEmbed =
    match[0] == "["
      ? createCardEmbed(card)
      : match[0] == "{"
      ? createCardImageEmbed(card)
      : createCardFlavourEmbed(card);
  channel.send({ embeds: [outEmbed] });

  return true;
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
