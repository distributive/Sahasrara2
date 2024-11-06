/**
 * A module for handling the loading, updating, and saving of whitelisted
 * servers.
 *
 * @file   This files defines the Permissions/serverWhitelist module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import fs from "fs";
import YAML from "yaml";
import { normalise } from "../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

let WHITELIST; // Persistent data

/**
 * Loads the whitelist from resources into the cache.
 */
export function loadWhitelist() {
  if (fs.existsSync("./resources/serverWhitelist.yml")) {
    const file = fs.readFileSync("./resources/serverWhitelist.yml", "utf8");
    WHITELIST = YAML.parse(file);
  }
  if (!WHITELIST) {
    WHITELIST = {};
  }
  if (!WHITELIST.whitelist) {
    WHITELIST.whitelist = [];
  }
}

/**
 * Saves the current version of the cached whitelist to resources.
 */
export function saveWhitelist() {
  const yaml = WHITELIST ? YAML.stringify(WHITELIST) : "";
  fs.writeFileSync("./resources/serverWhitelist.yml", yaml, {
    encoding: "utf8",
  });
}

///////////////////////////////////////////////////////////////////////////////

/**
 * Adds a new alias-card mapping to the cached aliases.
 *
 * @param {string} serverId The ID of the server to add.
 * @return {bool} Was the assignment successful (if not, that server was already whitelisted).
 */
export function addServer(serverId) {
  if (WHITELIST.whitelist.includes(serverId)) {
    return false;
  } else {
    WHITELIST.whitelist.push(serverId);
    return true;
  }
}

/**
 * Adds a new alias-card mapping to the cached aliases.
 *
 * @param {string} serverId The ID of the server to remove.
 * @return {bool} Was the deletion successful.
 */
export function removeServer(serverId) {
  if (WHITELIST.whitelist.includes(serverId)) {
    WHITELIST.whitelist = WHITELIST.whitelist.filter((sID) => sID !== serverId);
    return true;
  } else {
    return false;
  }
}

/**
 * Empties the whitelist.
 */
export function clear() {
  WHITELIST.whitelist = [];
}

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {string} serverId A server ID.
 * @return {bool} If the given server is in the whitelist.
 */
export function isServerWhitelisted(serverId) {
  return WHITELIST.whitelist.includes(serverId);
}

/**
 * @return {string[]} An array of whitelisted servers.
 */
export function getWhitelistedServerIds() {
  return WHITELIST.whitelist;
}
