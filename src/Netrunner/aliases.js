/**
 * A module for handling the loading, updating, and saving of card aliases.
 *
 * @file   This files defines the Netrunner/aliases module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import fs from "fs";
import YAML from "yaml";
import { normalise } from "./../Utility/text.js";
import { randomElement } from "../Utility/random.js";

///////////////////////////////////////////////////////////////////////////////

let ALIASES; // Persistent data

/**
 * Loads the alias data from resources into the cache.
 */
export function loadAliases() {
  if (fs.existsSync("./resources/aliases.yml")) {
    const file = fs.readFileSync("./resources/aliases.yml", "utf8");
    ALIASES = YAML.parse(file);
  }
  if (!ALIASES) {
    ALIASES = {};
  }
  if (!ALIASES.aliases) {
    ALIASES.aliases = {};
  }
}

/**
 * Saves the current version of the cached alias data to resources.
 */
export function saveAliases() {
  const yaml = ALIASES ? YAML.stringify(ALIASES) : "";
  fs.writeFileSync("./resources/aliases.yml", yaml, {
    encoding: "utf8",
  });
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Adds a new alias-card mapping to the cached aliases.
 *
 * @param {string} alias A string to map to a specific card.
 * @param {string} cardName A card's name (not verified).
 * @param {bool} canGroup If true, and there's already a card with this alias, create a list of aliases for that card.
 * @return {bool} Was the assignment successful (if not, there was already an alias with that string).
 */
export function addAlias(alias, cardName, canGroup) {
  // If that alias does not exist, create it
  if (!ALIASES.aliases[alias]) {
    ALIASES.aliases[alias] = cardName;
    return true;
  }

  // If you cannot group aliases, fail
  if (!canGroup) {
    return false;
  }

  // If the alias already contains only the card, fail
  if (ALIASES.aliases[alias] == cardName) {
    return false;
  }

  // If the alias is currently a singleton, make it a list
  if (typeof ALIASES.aliases[alias] == "string") {
    ALIASES.aliases[alias] = [ALIASES.aliases[alias]];
  }
  // If not, and the alias already contains the card, fail
  else if (ALIASES.aliases[alias].includes(cardName)) {
    return false;
  }

  // Add the alias
  ALIASES.aliases[alias].push(cardName);
  return true;
}

/**
 * Adds a new alias-card mapping to the cached aliases.
 *
 * @param {string} alias The alias to remove.
 * @param {?string} cardName An optional card name. If specified, only remove that card from the alias.
 * @return {bool} Was the deletion successful (if not, there was no alias with that string).
 */
export function removeAlias(alias, cardName) {
  // If the alias does not exist, fail
  if (!ALIASES.aliases[alias]) {
    return false;
  }

  // If a card is specified, check if it exists to be deleted
  if (cardName) {
    // If the alias is a singleton, and that singleton is the card, delete the entry
    if (ALIASES.aliases[alias] == cardName) {
      delete ALIASES.aliases[alias];
      return true;
    }
    // If not, and the alias is not a list, fail
    else if (typeof ALIASES.aliases[alias] == "string") {
      return false;
    }
    // Search the alias group for the card and succeed or fail based on the result
    else {
      const index = ALIASES.aliases[alias].indexOf(cardName);
      if (index > -1) {
        ALIASES.aliases[alias].splice(index, 1);
        if (ALIASES.aliases[alias].length == 1) {
          ALIASES.aliases[alias] = ALIASES.aliases[alias][0]; // The alias is now a singleton - simplify it
        } else if (ALIASES.aliases[alias].length == 0) {
          delete ALIASES.aliases[alias]; // The alias group is empty - delete it
        }
        return true;
      } else {
        return false;
      }
    }
  }
  // Otherwise, just delete the entire entry
  else {
    delete ALIASES.aliases[alias];
    return true;
  }
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Takes a string and attempts to find a card it is an alias for. If there is
 * none, it returns the input unchanged.
 *
 * @param {string} alias A string to be dealiased.
 * @return {string} The dealiased string.
 */
export function applyAlias(input) {
  const alias = ALIASES.aliases[normalise(input).replace(/[-_]/g, " ")];
  return alias
    ? typeof alias == "string"
      ? alias
      : randomElement(alias)
    : input;
}

/**
 * Takes a card's name and returns an array of all aliases for that card.
 *
 * @param {string} cardName The name of a card.
 * @return {string[]} An array of all aliases for that card.
 */
export function listAliases(cardName) {
  return Object.keys(ALIASES.aliases).filter((alias) => {
    const cards = ALIASES.aliases[alias];
    return typeof cards == "string"
      ? cards == cardName
      : cards.includes(cardName);
  });
}
