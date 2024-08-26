const { closest } = require("fastest-levenshtein");
const { normalise } = require("./../Utility/utils.js");

const DATA = {}; // Persistent data - assigned to in init()

///////////////////////////////////////////////////////////////////////////////

async function init() {
  const cardURL = `${process.env.API_URL}cards?page%5Blimit%5D=100&page%5Boffset%5D=0`;
  DATA.cardTitles = await fetchCards(cardURL, (card) => normalise(card.attributes.title));
  DATA.cardTypes = await fetchDataAsMap(`${process.env.API_URL}card_types`);
  DATA.factions = await fetchDataAsMap(`${process.env.API_URL}factions`);
}

///////////////////////////////////////////////////////////////////////////////
// API fetching

async function fetchCards(url, mapFunc) {
  return await fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(json => {
      const data = json.data.map(mapFunc);
      const next = json.links.next;
      if (next == null || next == url) {
        return data;
      } else {
        return fetchCards(next, mapFunc).then(nextData => {
          return data.concat(nextData);
        });
      }
    })
    .catch(error => {
      console.error("Failed to load cards from API:", error);
      return [];
    });
}

async function fetchCard(cardId) {
  return await fetch(`${process.env.API_URL}cards/${cardId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(json => {
      return json.data;
    })
    .catch(error => {
      console.error(`Failed to load card ${cardId} from API:`, error);
    });
}

async function fetchPrinting(printingId) {
  return await fetch(`${process.env.API_URL}printings/${printingId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(json => {
      return json.data;
    })
    .catch(error => {
      console.error(`Failed to load card ${cardId} from API:`, error);
    });
}

async function fetchData(url) {
  return await fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(json => {
      return json.data;
    })
    .catch(error => {
      console.error("Failed to load cards from API:", error);
      return {};
    });
}

// Fetches the json from a URL and returns a map of each result's ID to the result
async function fetchDataAsMap(url) {
  const data = await fetchData(url);
  let obj = {};
  if (!data.length && data.length !== 0) {
    obj[data.id] = data;
    return obj;
  }
  data.forEach(entry => {
    obj[entry.id] = entry;
  });
  return obj;
}

///////////////////////////////////////////////////////////////////////////////
// Cards

async function getClosestCard(input) {
  input = normalise(input);
  const superStrings = DATA.cardTitles.filter(title => title.includes(input)); // cardTitles has already been normalised
  const leadingStrings = superStrings.filter(title => title.substring(0, input.length) == input);
  const name = leadingStrings.length > 0 ? closest(input, leadingStrings) : superStrings.length > 0 ? closest(input, superStrings) : closest(input, DATA.cardTitles);
  const id = normalise(name).replace(/[^a-zA-Z0-9 -]/g, '').replace(/[ -]/g, "_");
  return fetchCard(id);
}

///////////////////////////////////////////////////////////////////////////////
// Card types

function getCardType(cardTypeId) {
  return DATA.cardTypes[cardTypeId];
}

///////////////////////////////////////////////////////////////////////////////
// Factions

function getFaction(factionId) {
  return DATA.factions[factionId];
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  init,
  
  fetchCards,
  fetchCard,
  fetchPrinting,
  fetchData,
  fetchDataAsMap,
  
  getClosestCard,
  
  getCardType,

  getFaction,
}