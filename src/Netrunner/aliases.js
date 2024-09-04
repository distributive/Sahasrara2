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
 * @return {bool} Was the assignment successful (if not, there was already an alias with that string).
 */
export function addAlias(alias, cardName) {
  if (ALIASES.aliases[alias]) {
    return false;
  } else {
    ALIASES.aliases[alias] = cardName;
    return true;
  }
}

/**
 * Adds a new alias-card mapping to the cached aliases regardless of if there is already one with that alias.
 *
 * @param {string} alias A string to map to a specific card.
 * @param {string} cardName A card's name (not verified).
 */
export function forceAddAlias(alias, cardName) {
  ALIASES.aliases[alias] = cardName;
}

/**
 * Adds a new alias-card mapping to the cached aliases.
 *
 * @param {string} alias The alias to remove.
 * @return {bool} Was the deletion successful (if not, there was no alias with that string).
 */
export function removeAlias(alias) {
  if (ALIASES.aliases[alias]) {
    delete ALIASES.aliases[alias];
    return true;
  } else {
    return false;
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
  return alias ? alias : input;
}

/**
 * Takes a card's name and returns an array of all aliases for that card.
 *
 * @param {string} cardName The name of a card.
 * @return {string[]} An array of all aliases for that card.
 */
export function listAliases(cardName) {
  return Object.keys(ALIASES.aliases).filter(
    (alias) => ALIASES.aliases[alias] == cardName
  );
}
