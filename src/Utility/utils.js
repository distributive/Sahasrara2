/**
 * A generic utility module. When too many utility functions are needed for one file, this will become the root util module.
 *
 * @file   This files defines a collection of generic utility functions.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

const removeAccents = require("remove-accents");

///////////////////////////////////////////////////////////////////////////////

/**
 * Removes all diacritics from a string and makes it lowercase.
 *
 * @param {string} input The string to normalise.
 * @return {string} The normalised string.
 */
function normalise(input) {
  return removeAccents(input).toLowerCase();
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  normalise,
};
