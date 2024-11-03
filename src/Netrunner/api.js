/**
 * A module for fetching data from the NetrunnerDB v3 API.
 *
 * @file   This files defines the Netrunner/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import fs from "fs";
import { bestMatch } from "../Utility/fuzzySearch.js";
import { normalise } from "./../Utility/text.js";
import { loadAliases } from "./aliases.js";

///////////////////////////////////////////////////////////////////////////////
// Init

/**
 * @typedef NrData
 * @type {Object}
 * @property {Object} cardTypes - A map of card type IDs to card type API data.
 * @property {Object} factions - A map of faction IDs to faction API data.
 * @property {Object} formats - A map of format IDs to format API data.
 * @property {Object} cardPools - A map of card pool IDs to card pool API data.
 * @property {Object} restrictions - A map of restriction IDs to restriction API data.
 * @property {Object} cardCycles - A map of card cycle IDs to card cycle API data.
 * @property {Object} cardSets - A map of card set IDs to card set API data.
 * @property {string[]} normalisedCardTitles - An array of lowercase card titles with special characters removed.
 * @property {Object} normalisedToUnnormalisedCardTitles - A map of normalised card titles to their unmodified versions.
 * @property {Object} acronymsToCardIds - A map of strings to card IDs they are acronyms of.
 * @property {Object} mappedCardTitles - A map of characters to a list of normalised card titles starting with that character.
 * @property {Object} cardIdToIsLocal - A map of card IDs to a bool declaring if their card is defined locally (true) or by the API (false/null).
 * @property {Object} printingIdToIsLocal - A map of printings IDs to a bool declaring if their printing is defined locally (true) or by the API (false/null).
 * @property {Object} snapshots - A map of format IDs to lists of snapshots belonging to each format.
 * @property {Object} cardPoolIdsToCardIds - A map of card pool IDs to the list of card IDs of cards they contain.
 */

/**
 * An object to store all card data used throughout the bot's lifetime.
 * @type {NrData}
 */
const DATA = {};

/**
 * Initialises the api.
 *
 * This function should be called exactly once (at startup) to initialise data
 * from NetrunnerDB and any local data from resources.
 */
export async function init() {
  await loadApiData();
  loadAliases();
}

/**
 * Loads a data object storing all required data from the NetrunnerDB API.
 *
 * This function should be called exactly once (at startup) to initialise and
 * cache some NRDB data. Some data sets are precalculated here (see the typedef
 * for NrData).
 *
 * Also loads local json for the following data:
 * - Cards
 * - Printings
 * - Card Sets
 * - Card Cycles
 *
 * The Netrunner API should ideally not be accessed again, except to reload
 * this data.
 */
async function loadApiData() {
  DATA.cardTypes = await fetchDataAsMap(`${process.env.API_URL}card_types`);
  DATA.factions = await fetchDataAsMap(`${process.env.API_URL}factions`);
  DATA.formats = await fetchDataAsMap(`${process.env.API_URL}formats`);
  DATA.cardPools = await fetchDataAsMap(`${process.env.API_URL}card_pools`);
  DATA.restrictions = await fetchDataAsMap(
    `${process.env.API_URL}restrictions`
  );

  const apiCardCycles = await fetchDataAsMap(
    `${process.env.API_URL}card_cycles?sort=-date_release`
  );
  const localCardCycles = loadDirDataAsMap("resources/CardData/CardCycles");
  DATA.cardCycles = mergeObjects([apiCardCycles, localCardCycles].flat());

  const apiCardSets = await fetchDataAsMap(
    `${process.env.API_URL}card_sets?sort=-date_release`
  );
  const localCardSets = loadDirDataAsMap("resources/CardData/CardSets");
  DATA.cardSets = mergeObjects([apiCardSets, localCardSets].flat());

  // Cache card titles
  const cardURL = `${process.env.API_URL}cards?page%5Blimit%5D=100&page%5Boffset%5D=0`;
  const apiCards = await fetchCards(cardURL);
  const localCards = loadAllCards();
  let allCards = apiCards.concat(localCards);
  allCards = allCards.sort((a, b) =>
    a.attributes.release_date < b.attributes.release_date ? 1 : -1
  );

  // Map card IDs to whether they are local (true) or remote (false/null)
  // Local takes precedence
  DATA.cardIdToIsLocal = {};
  localCards.forEach((card) => {
    DATA.cardIdToIsLocal[card.id] = true;
  });

  // Map printing IDs to whether they are local (true) or remote (false/null)
  // Local takes precedence
  DATA.printingIdToIsLocal = {};
  loadAllPrintings().forEach((printing) => {
    DATA.printingIdToIsLocal[printing.id] = true;
  });

  // Get snapshots (we don't store this directly, but group it later by format)
  const snapshots = await fetchData(`${process.env.API_URL}snapshots`);

  DATA.normalisedCardTitles = [];
  DATA.normalisedToUnnormalisedCardTitles = {};
  DATA.acronymsToCardIds = {};
  allCards.forEach((card) => {
    const normalised = normalise(card.attributes.title);
    DATA.normalisedCardTitles.push(normalised);
    DATA.normalisedToUnnormalisedCardTitles[normalised] = card.attributes.title;
    const acronym = normalised
      .split(/[ ]/)
      .map((s) => s[0])
      .join("");
    if (!DATA.acronymsToCardIds[acronym]) {
      DATA.acronymsToCardIds[acronym] = card.id;
    }
  });

  // Searchable object of normalised card titles
  // An object where each key is a character whose value is a list of normalised card titles starting with that character
  DATA.mappedCardTitles = {};
  DATA.normalisedCardTitles.forEach((title) => {
    const char = title[0];
    if (DATA.mappedCardTitles[char]) {
      DATA.mappedCardTitles[char].push(title);
    } else {
      DATA.mappedCardTitles[char] = [title];
    }
  });

  // Split snapshots by format
  DATA.snapshots = {};
  Object.keys(DATA.formats).forEach((formatId) => {
    DATA.snapshots[formatId] = snapshots
      .filter((snapshot) => snapshot.attributes.format_id == formatId)
      .sort((a, b) =>
        a.attributes.date_start < b.attributes.date_start ? -1 : 1
      );
  });

  // Map card pools to their cards' IDs
  DATA.cardPoolIdsToCardIds = {};
  Object.keys(DATA.cardPools).forEach((cardPoolId) => {
    const cards = allCards.filter((card) => {
      DATA.cardPools[cardPoolId].attributes.card_cycle_ids.some((cycleId) =>
        card.attributes.card_cycle_ids.includes(cycleId)
      );
    });
    DATA.cardPoolIdsToCardIds[cardPoolId] = cards.map((card) => card.id);
  });
}

///////////////////////////////////////////////////////////////////////////////
// API fetching

/**
 * Fetches every card in the API. Use sparingly.
 *
 * @param {string} url The URL to fetch the cards from.
 * @param {Function=} mapFunc A function to apply to each card after being fetched (optional).
 * @return {Object[]} An array containing every card object in the API.
 */
export async function fetchCards(url, mapFunc) {
  return await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((json) => {
      const data = mapFunc ? json.data.map(mapFunc) : json.data;
      const next = json.links.next;
      if (next == null || next == url) {
        return data;
      } else {
        return fetchCards(next, mapFunc).then((nextData) => {
          return data.concat(nextData);
        });
      }
    })
    .catch((error) => {
      console.error("Failed to load cards from API:", error);
      return [];
    });
}

/**
 * Fetches the card matching the given ID. If it is an API card it will fetch
 * it from the API. Otherwise, it will search the local card store for it.
 *
 * @param {string} cardId A card's ID.
 * @return {Object} The card with the given ID from the API.
 */
export async function fetchCard(cardId) {
  if (!DATA.cardIdToIsLocal[cardId]) {
    return await fetch(`${process.env.API_URL}cards/${cardId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => {
        return json.data;
      })
      .catch((error) => {
        console.error(`Failed to load card ${cardId} from API:`, error);
      });
  } else {
    const localCards = loadAllCards();
    const card = localCards.find((card) => card.id == cardId);
    if (!card) {
      console.error(`Failed to find card ${cardId} in local json.`);
    }
    return card;
  }
}

/**
 * @param {string} printingId A printing's ID.
 * @return {Object} The printing with the given ID from the API.
 */
export async function fetchPrinting(printingId) {
  if (!DATA.printingIdToIsLocal[printingId]) {
    return await fetch(`${process.env.API_URL}printings/${printingId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => {
        return json.data;
      })
      .catch((error) => {
        console.error(`Failed to load card ${cardId} from API:`, error);
      });
  } else {
    const localPrintings = loadAllPrintings();
    const printing = localPrintings.find(
      (printing) => printing.id == printingId
    );
    if (!printing) {
      console.error(`Failed to find printing ${printingId} in local json.`);
    }
    return printing;
  }
}

/**
 * A generic function for fetching data from the json API (fetches all pages).
 *
 * @param {string} url The URL to fetch the data from.
 * @return {*} The contents of json.data.
 */
export async function fetchData(url) {
  return await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok with url: ${url}`);
      }
      return response.json();
    })
    .then((json) => {
      const data = json.data;
      const next = json.links.next;
      if (next == null || next == url) {
        return data;
      } else {
        return fetchData(next).then((nextData) => {
          return data.concat(nextData);
        });
      }
    })
    .catch((error) => {
      console.error("Failed to load data from API:", error);
      return {};
    });
}

/**
 * A generic function for fetching data from a json API page as an object
 * mapping the ID of each element to that element.
 *
 * @param {string} url The URL to fetch the data from.
 * @return {Object} The reformatted contents of json.data.
 */
export async function fetchDataAsMap(url) {
  const data = await fetchData(url);
  const obj = {};
  if (!data.length && data.length !== 0) {
    obj[data.id] = data;
    return obj;
  }
  data.forEach((entry) => {
    obj[entry.id] = entry;
  });
  return obj;
}

/** A function for loading all json files in a directory.
 *
 * @param {string} path The path of the directory to load.
 * @return {Object[]} An array of json.data objects.
 */
function loadDirData(path) {
  const files = fs.readdirSync(path);
  return files.map((file) => loadData(`${path}/${file}`));
}

/**
 * A generic function for loading data from a local json file.
 *
 * @param {string} path The path to load the data from.
 * @return {*} The contents of json.data.
 */
function loadData(path) {
  return JSON.parse(fs.readFileSync(path)).data;
}

/** A function for loading all files in a directory and formatting them as
 * objects mapping the ID of each element to that element.
 *
 * @param {string} path The path of the directory to load.
 * @return {Object[]} An array of formatted objects.
 */
function loadDirDataAsMap(path) {
  const files = fs.readdirSync(path);
  return files.map((file) => loadDataAsMap(`${path}/${file}`));
}

/**
 * A generic function for loading local json data from a given file as an
 * object mapping the ID of each element to that element.
 *
 * @param {string} path The path to the file to load the data from.
 * @return {Object} The reformatted contents of json.data.
 */
function loadDataAsMap(path) {
  const data = loadData(path);
  const obj = {};
  if (!data.length && data.length !== 0) {
    obj[data.id] = data;
    return obj;
  }
  data.forEach((entry) => {
    obj[entry.id] = entry;
  });
  return obj;
}

/**
 * A function that merges a list of objects, adding their key-value pairs to a
 * new object.
 *
 * Duplicate keys should be avoided. When they occur, later objects in the list
 * take priority.
 *
 * @param {Object[]} objects An array of objects to be merged.
 * @return {Object} A new object with the key-value pairs of all the objects.
 */
function mergeObjects(objects) {
  const newObj = {};
  objects.forEach((object) => {
    Object.keys(object).forEach((k) => {
      newObj[k] = object[k];
    });
  });
  return newObj;
}

/**
 * Loads every card from the local card files.
 *
 * @param {Function=} mapFunc A function to apply to each card after being fetched (optional).
 * @return {Object[]} An array containing every card object in the local json files.
 */
function loadAllCards(mapFunc) {
  const cards = loadDirData("resources/CardData/Cards").flat();
  return mapFunc ? cards.map(mapFunc) : cards;
}

/**
 * Loads every printing from the local card files.
 *
 * @param {Function=} mapFunc A function to apply to each printing after being fetched (optional).
 * @return {Object[]} An array containing every printing object in the local json files.
 */
function loadAllPrintings(mapFunc) {
  const printings = loadDirData("resources/CardData/Printings").flat();
  return mapFunc ? printings.map(mapFunc) : printings;
}

///////////////////////////////////////////////////////////////////////////////
// Cards

/**
 * Finds the card with the title closest to the given string.
 *
 * This function uses Levenshtein distance to find the card whose title most
 * closely matches the given string. It first attempts to find and limit the
 * search to card titles that contain the input as a leading substring. If
 * there are none, it attempts to limit the search to card titles that contain
 * the input as a substring anywhere. If there are none, it applies the search
 * to the entire card pool.
 *
 * @param {string} input A string to find a card match for.
 * @return {Object} The card whose title most closely matches the input.
 */
export async function getClosestCard(input) {
  const query = normalise(input);

  // If the input is all uppercase, attempt to treat it as an acronym
  if (
    query.length > 1 &&
    input.toUpperCase() == input &&
    DATA.acronymsToCardIds[query]
  ) {
    return fetchCard(DATA.acronymsToCardIds[query]);
  }

  // Regular queries
  const superStrings = DATA.normalisedCardTitles.filter((title) =>
    title.includes(query)
  );
  const leadingStrings = superStrings.filter((title) =>
    title.startsWith(query)
  );
  const name =
    leadingStrings.length > 0
      ? bestMatch(query, leadingStrings)
      : superStrings.length > 0
      ? bestMatch(query, superStrings)
      : bestMatch(query, DATA.normalisedCardTitles);
  const id = normalise(name)
    .replace(/[^a-zA-Z0-9 .&/-]/g, "") // Remove invalid characters
    .replace(/[^a-zA-Z0-9]/g, "_") // Normalise non-alphanumerics to underscores
    .replace(/^_+|_+$/g, "") // Strip trailing underscores
    .replace(/__+/g, "_"); // Condense sequential underscores
  return fetchCard(id);
}

/**
 * @return {string[]} The array of every card title in the game, normalised.
 */
export function getNormalisedCardTitles() {
  return DATA.normalisedCardTitles;
}

/**
 * @param {string} input A normalised card title.
 * @return {string} The title of that card in its original form.
 */
export function denomraliseCardTitle(cardTitle) {
  return DATA.normalisedToUnnormalisedCardTitles[cardTitle];
}

/**
 * @param {string} query A card title search query (must be normalised).
 * @return {string} The title of that card in its original form.
 */
export function searchNormalisedCardTitles(query) {
  if (query && query.length > 0) {
    const firstResults = DATA.mappedCardTitles[query[0]];
    if (firstResults) {
      return firstResults.filter((title) => title.startsWith(query));
    }
  }
  return [];
}

///////////////////////////////////////////////////////////////////////////////
// Card types

/**
 * Gets the card type of the given ID from the cache.
 *
 * @param {string} cardTypeId A card type's ID.
 * @return {Object} The corresponding card type.
 */
export function getCardType(cardTypeId) {
  return DATA.cardTypes[cardTypeId];
}

///////////////////////////////////////////////////////////////////////////////
// Factions

/**
 * Gets the faction of the given ID from the cache.
 *
 * @param {string} factionId A faction's ID.
 * @return {Object} The corresponding faction.
 */
export function getFaction(factionId) {
  return DATA.factions[factionId];
}

///////////////////////////////////////////////////////////////////////////////
// Formats

/**
 * Gets the format of the given ID from the cache.
 *
 * @param {string} formatId A format's ID.
 * @return {Object} The corresponding format.
 */
export function getFormat(formatId) {
  return DATA.formats[formatId];
}

///////////////////////////////////////////////////////////////////////////////
// Sets

/**
 * Gets the set of the given ID from the cache.
 *
 * @param {string} cardSetId A set's ID.
 * @return {Object} The corresponding set.
 */
export function getCardSet(cardSetId) {
  return DATA.cardSets[cardSetId];
}

/**
 * Returns the array of all card sets. Do not modify.
 *
 * @return {Object[]} An array of all Netrunner sets.
 */
export function getAllCardSets() {
  return DATA.cardSets;
}

/**
 * Gets the list of printings in a card set. We need this because the API
 * endpoint for card sets does not include this list as an attribute.
 *
 * @param {string} cardSetId A set's ID.
 * @return {string[]} An array of that set's printings.
 */
export async function fetchCardSetPrintings(cardSetId) {
  return await fetchCards(
    `${process.env.API_URL}printings?filter[card_set_id]=${cardSetId}`
  );
}

///////////////////////////////////////////////////////////////////////////////
// Cycles

/**
 * Gets the cycle of the given ID from the cache.
 *
 * @param {string} cardCycleId A cycle's ID.
 * @return {Object} The corresponding cycle.
 */
export function getCardCycle(cardCycleId) {
  return DATA.cardCycles[cardCycleId];
}

/**
 * Returns the map of all card cycles. Do not modify.
 *
 * @return {Object} A mapping of all card cycle IDs to their card cycle.
 */
export function getAllCardCycles() {
  return DATA.cardCycles;
}

///////////////////////////////////////////////////////////////////////////////
// Card pools

/**
 * Gets the card pool of the given ID from the cache.
 *
 * @param {string} cardPoolId A card pool's ID.
 * @return {Object} The corresponding card pool.
 */
export function getCardPool(cardPoolId) {
  return DATA.cardPools[cardPoolId];
}

/**
 * Gets the active card pool of the format with the given ID.
 *
 * @param {string} formatId A format's ID.
 * @return {?Object} That format's active restriction.
 */
export function getActiveCardPool(formatId) {
  return DATA.cardPools[DATA.formats[formatId].attributes.active_card_pool_id];
}

/**
 * @param {string} cardId A Netrunner card's ID.
 * @param {string} cardPoolId A card pool's ID.
 * @return {bool} The legality of the card under the restriction.
 */
export function isCardInCardPool(cardId, cardPoolId) {
  return DATA.cardPoolIdsToCardIds[cardPoolId].includes(cardId);
}

/**
 * @param {string} cardSetId A Netrunner set's ID.
 * @param {string} cardPoolId A card pool's ID.
 * @return {bool} The legality of the card under the restriction.
 */
export function isCardSetInCardPool(cardSetID, cardPoolId) {
  const cardCycleId = DATA.cardSets[cardSetID].attributes.card_cycle_id;
  return DATA.cardPools[cardPoolId].attributes.card_cycle_ids.includes(
    cardCycleId
  );
}

///////////////////////////////////////////////////////////////////////////////
// Restrictions

/**
 * Gets the format of the given ID from the cache.
 *
 * @param {string} restrictionId A restriction's ID.
 * @return {Object} The corresponding restriction.
 */
export function getRestriction(restrictionId) {
  return DATA.restrictions[restrictionId];
}

/**
 * Gets the active restriction of the format with the given ID.
 *
 * @param {string} formatId A format's ID.
 * @return {?Object} That format's active restriction.
 */
export function getActiveRestriction(formatId) {
  return DATA.restrictions[
    DATA.formats[formatId].attributes.active_restriction_id
  ];
}

/**
 * Gets the legality of a card under the given restriction.
 *
 * @param {string} cardId A card ID.
 * @param {Object} restriction A restriction.
 * @return {string} The legality of the card under the restriction.
 */
export function getLegalityUnderRestriction(cardId, restriction) {
  const verdicts = restriction.attributes.verdicts;
  if (verdicts.banned.includes(cardId)) {
    return "banned";
  } else if (verdicts.restricted.includes(cardId)) {
    return "restricted";
  } else if (verdicts.global_penalty.includes(cardId)) {
    return "global_penalty";
  }
  if (Object.keys(verdicts.points).includes(cardId)) {
    return "points_" + verdicts.points[cardId];
  } else if (Object.keys(verdicts.universal_faction_cost).includes(cardId)) {
    return "universal_faction_cost_" + verdicts.universal_faction_cost[cardId];
  }
  return "legal";
}

///////////////////////////////////////////////////////////////////////////////
// Snapshots

/**
 * Gets a format's snapshots.
 *
 * @param {string} formatId A format's ID.
 * @return {Object[]} An array of that format's snapshots.
 */
export function getFormatSnapshots(formatId) {
  return DATA.snapshots[formatId];
}
