/**
 * A module for fetching data from the NetrunnerDB v3 API.
 *
 * @file   This files defines the Netrunner/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { closest } from "fastest-levenshtein";
import { normalise } from "./../Utility/utils.js";

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
 */
async function init() {
  const cardURL = `${process.env.API_URL}cards?page%5Blimit%5D=100&page%5Boffset%5D=0`;
  DATA.cardTitles = await fetchCards(cardURL, (card) =>
    normalise(card.attributes.title)
  );
  DATA.cardTypes = await fetchDataAsMap(`${process.env.API_URL}card_types`);
  DATA.factions = await fetchDataAsMap(`${process.env.API_URL}factions`);
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
async function fetchCards(url, mapFunc) {
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
async function fetchCard(cardId) {
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
async function fetchPrinting(printingId) {
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
async function fetchData(url) {
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
async function fetchDataAsMap(url) {
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
async function getClosestCard(input) {
  input = normalise(input);
  const superStrings = DATA.cardTitles.filter((title) => title.includes(input)); // cardTitles has already been normalised
  const leadingStrings = superStrings.filter(
    (title) => title.substring(0, input.length) == input
  );
  const name =
    leadingStrings.length > 0
      ? closest(input, leadingStrings)
      : superStrings.length > 0
      ? closest(input, superStrings)
      : closest(input, DATA.cardTitles);
  const id = normalise(name)
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .replace(/[ -]/g, "_");
  return fetchCard(id);
}

///////////////////////////////////////////////////////////////////////////////
// Card types

/**
 * Gets the card type of the given ID from the cache.
 *
 * @param {string} cardTypeId A card type's ID.
 * @return {Object} The corresponding card type.
 */
function getCardType(cardTypeId) {
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
function getFaction(factionId) {
  return DATA.factions[factionId];
}

///////////////////////////////////////////////////////////////////////////////

export {
  init,
  fetchCards,
  fetchCard,
  fetchPrinting,
  fetchData,
  fetchDataAsMap,
  getClosestCard,
  getCardType,
  getFaction,
};
