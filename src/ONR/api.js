const { closest } = require("fastest-levenshtein");
const { normalise } = require("./../Utility/utils.js");

const DATA = {}; // Persistent data - assigned to in init()

///////////////////////////////////////////////////////////////////////////////

async function init() {
  
  const json = await fetch(process.env.ONR_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch(error => {
      console.error("Failed to load cards from ONR API:", error);
      return [];
    });

  DATA.imageUrlTemplate = json.imageUrlTemplate;
  
  // Format cards as a mapping from their normalised name to the card object
  DATA.cards = {};
  DATA.cardTitles = [];
  json.cards.forEach(card => {
    const cardTitle = normalise(card.title);
    DATA.cards[cardTitle] = card;
    DATA.cards[cardTitle].type = DATA.cards[cardTitle].type_code.charAt(0).toUpperCase() + DATA.cards[cardTitle].type_code.substring(1).toLowerCase();
    DATA.cardTitles.push(cardTitle);
  });
}

///////////////////////////////////////////////////////////////////////////////

function getClosestCard(input) {
  input = normalise(input);
  const superStrings = DATA.cardTitles.filter(title => title.includes(input)); // cardTitles has already been normalised
  const leadingStrings = superStrings.filter(title => title.substring(0, input.length) == input);
  const name = leadingStrings.length > 0 ? closest(input, leadingStrings) : superStrings.length > 0 ? closest(input, superStrings) : closest(input, DATA.cardTitles);
  return DATA.cards[name];
}

///////////////////////////////////////////////////////////////////////////////

function getCardImage(card) {
  return DATA.imageUrlTemplate.replace("{code}", card.code);
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  init,
  getClosestCard,
  getCardImage,
}