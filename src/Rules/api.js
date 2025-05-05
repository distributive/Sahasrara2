/**
 * A module for fetching data from the NetrunnerDB v3 API.
 *
 * @file   This files defines the Netrunner/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import fs from "fs";
import { bestMatch } from "../Utility/fuzzySearch.js";

///////////////////////////////////////////////////////////////////////////////
// Init

/**
 * @typedef Rule
 * @type {Object}
 * @property {string} id - The rule's internal ID.
 * @property {string} nr - The rule's user-facing ID (e.g. 1.2.3.b).
 * @property {string} type - Whether the rule is a "section" or "rule".
 * @property {string} text - The rule text.
 * @property {[string]} children - A list of rule IDs belonging to child rules.
 * @property {?[string]} examples - A list of examples of the rule.
 */

/**
 * An object to store all card data used throughout the bot's lifetime.
 * @type {[Rule]}
 */
const DATA = {};

/**
 * Initialises the api.
 *
 * This function should be called exactly once (at startup) to initialise data
 * from NetrunnerDB and any local data from resources.
 */
export async function init() {
  const rules = await fetchRules();

  DATA.idToRule = {};
  rules.forEach((rule) => {
    DATA.idToRule[rule.id] = rule;
  });

  DATA.nrToId = {};
  rules.forEach((rule) => {
    DATA.nrToId[rule.nr] = rule.id;
  });
}

///////////////////////////////////////////////////////////////////////////////
// Rules

/**
 * Gets the rule with the given ID.
 *
 * @param {string} ruleId A rule's ID.
 * @return {Rule} The corresponding rule.
 */
export function getRule(ruleId) {
  return DATA.idToRule[ruleId];
}

/**
 * Gets the rule with the given nr.
 *
 * @param {string} ruleNr A rule's nr value.
 * @return {Rule} The corresponding rule.
 */
export function getRuleFromNr(ruleNr) {
  return getRule(DATA.nrToId[ruleNr]);
}

/**
 * Gets all rules' nr values.
 *
 * @return {[string]} Every nr value in the rules.
 */
export function getAllNrs() {
  return Object.keys(DATA.nrToId);
}

/**
 * Gets a list of rules that contain the given search query.
 *
 * @param {string} query A search query.
 * @return {[string]} Every rule that contains the query in its text.
 */
export function searchRules(query) {
  query = query.toLowerCase();
  return Object.values(DATA.idToRule).filter((rule) =>
    rule.text.toLowerCase().includes(query)
  );
}

///////////////////////////////////////////////////////////////////////////////
// API fetching

/**
 * Fetches all rules from the Rules API
 *
 * @return {[Rule]} All rules from the API.
 */
export async function fetchRules() {
  const url = `${process.env.RULES_URL}rules.json`;
  const json = await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok with url: ${url}`);
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error("Failed to load data from API: " + error);
    });
  return json;
}
