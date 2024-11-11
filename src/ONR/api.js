/**
 * A module for fetching Original Netrunner data.
 *
 * @file   This files defines the ONR/api module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { logError } from "../Utility/error.js";
import { bestMatch } from "../Utility/fuzzySearch.js";
import { normalise } from "./../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////
// Init

const DATA = {}; // Persistent data

/**
 * Initialises the api.
 *
 * This function should be called exactly once (at startup) to initialise and
 * cache all ONR data. There's a fixed card pool and it's relatively small so
 * we can afford to do this.
 */
async function init() {
  const json = await fetch(process.env.ONR_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error("Failed to load cards from ONR API: " + error);
    });

  DATA.imageUrlTemplate = json.imageUrlTemplate;

  // Format cards as a mapping from their normalised name to the card object
  DATA.cards = {};
  DATA.cardTitles = [];
  json.cards.forEach((card) => {
    const cardTitle = normalise(card.title);
    DATA.cards[cardTitle] = card;
    DATA.cards[cardTitle].type =
      DATA.cards[cardTitle].type_code.charAt(0).toUpperCase() +
      DATA.cards[cardTitle].type_code.substring(1).toLowerCase();
    DATA.cardTitles.push(cardTitle);
  });
}

///////////////////////////////////////////////////////////////////////////////
// Cards

/**
 * Finds the ONR card with the title closest to the given string.
 *
 * This function uses Levenshtein distance to find the ONR card whose title
 * most closely matches the given string. It first attempts to find and limit
 * the search to card titles that contain the input as a leading substring. If
 * there are none, it attempts to limit the search to card titles that contain
 * the input as a substring anywhere. If there are none, it applies the search
 * to the entire card pool.
 *
 * @param {string} input A string to find a card match for.
 * @return {Object} The card whose title most closely matches the input.
 */
function getClosestCard(input) {
  input = normalise(input);
  const superStrings = DATA.cardTitles.filter((title) => title.includes(input)); // cardTitles has already been normalised
  const leadingStrings = superStrings.filter(
    (title) => title.substring(0, input.length) == input
  );
  const name =
    leadingStrings.length > 0
      ? bestMatch(input, leadingStrings)
      : superStrings.length > 0
      ? bestMatch(input, superStrings)
      : bestMatch(input, DATA.cardTitles);
  return DATA.cards[name];
}

/**
 * @param {Object} card An ONR card.
 * @return {string} The image URL of that card.
 */
function getCardImage(card) {
  return DATA.imageUrlTemplate.replace("{code}", card.code);
}

///////////////////////////////////////////////////////////////////////////////

export { init, getClosestCard, getCardImage };
