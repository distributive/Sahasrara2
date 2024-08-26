const removeAccents = require("remove-accents");

function normalise(input) {
  return removeAccents(input).toLowerCase();
}

module.exports = {
  normalise
}