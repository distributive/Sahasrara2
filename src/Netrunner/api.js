/**
 * A module for fetching data from the NetrunnerDB v3 API.
 *
 * @file   This files defines the Netrunner/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { bestMatch } from "../Utility/fuzzySearch.js";
import { normalise } from "./../Utility/text.js";
import { loadAliases } from "./aliases.js";

///////////////////////////////////////////////////////////////////////////////
// Init

const DATA = {}; // Persistent data

/**
 * Initialises the api.
 *
 * This function should be called exactly once (at startup) to initialise and
 * cache some NRDB data. The title of each card is stored so as to avoid
 * fetching each card in the game every time there is a request, as are smaller
 * data sets; currently:
 * - Card types
 * - Factions
 * - Formats
 * - Card pools
 * - Restrictions
 * - Snapshots
 */
export async function init() {
  const cardURL = `${process.env.API_URL}cards?page%5Blimit%5D=100&page%5Boffset%5D=0`;
  DATA.cardTypes = await fetchDataAsMap(`${process.env.API_URL}card_types`);
  DATA.factions = await fetchDataAsMap(`${process.env.API_URL}factions`);
  DATA.formats = await fetchDataAsMap(`${process.env.API_URL}formats`);
  DATA.cardPools = await fetchDataAsMap(`${process.env.API_URL}card_pools`);
  DATA.restrictions = await fetchDataAsMap(
    `${process.env.API_URL}restrictions`
  );

  // Cache card titles
  const cardTitles = await fetchCards(cardURL, (card) => card.attributes.title);

  DATA.normalisedCardTitles = [];
  DATA.normalisedToUnnormalisedCardTitles = {};
  cardTitles.forEach((title) => {
    const normalised = normalise(title);
    DATA.normalisedCardTitles.push(normalised);
    DATA.normalisedToUnnormalisedCardTitles[normalised] = title;
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
  const snapshots = await fetchData(`${process.env.API_URL}snapshots`);
  DATA.snapshots = {};
  Object.keys(DATA.formats).forEach((formatId) => {
    DATA.snapshots[formatId] = snapshots
      .filter((snapshot) => snapshot.attributes.format_id == formatId)
      .sort((a, b) =>
        a.attributes.date_start < b.attributes.date_start ? -1 : 1
      );
  });

  // Load aliases
  loadAliases();
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
 * @param {string} cardId A card's ID.
 * @return {Object} The card with the given ID from the API.
 */
export async function fetchCard(cardId) {
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
}

/**
 * @param {string} printingId A printing's ID.
 * @return {Object} The printing with the given ID from the API.
 */
export async function fetchPrinting(printingId) {
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
}

/**
 * A generic function for fetching data from a json API page.
 *
 * @param {string} url The URL to fetch the data from.
 * @return {*} The contents of json.data.
 */
export async function fetchData(url) {
  return await fetch(url)
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
      console.error("Failed to load cards from API:", error);
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
  let obj = {};
  if (!data.length && data.length !== 0) {
    obj[data.id] = data;
    return obj;
  }
  data.forEach((entry) => {
    obj[entry.id] = entry;
  });
  return obj;
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
  input = normalise(input);
  const superStrings = DATA.normalisedCardTitles.filter((title) =>
    title.includes(input)
  );
  const leadingStrings = superStrings.filter((title) =>
    title.startsWith(input)
  );
  const name =
    leadingStrings.length > 0
      ? bestMatch(input, leadingStrings)
      : superStrings.length > 0
      ? bestMatch(input, superStrings)
      : bestMatch(input, DATA.normalisedCardTitles);
  const id = normalise(name)
    .replace(/[^a-zA-Z0-9 .-]/g, "") // Remove invalid characters
    .replace(/[ .-]/g, "_") // Normalise non-alphanumerics to underscores
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
 * @param {Object} cardPool A card pool.
 * @return {bool} The legality of the card under the restriction.
 */
export function isCardInCardPool(cardId, cardPool) {
  return cardPool.attributes.card_ids.includes(cardId);
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
