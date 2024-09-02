/**
 * A generic utility module. When too many utility functions are needed for one file, this will become the root util module.
 *
 * @file   This files defines a collection of generic utility functions.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import removeAccents from "remove-accents";

///////////////////////////////////////////////////////////////////////////////

/**
 * Removes all diacritics from a string and makes it lowercase.
 *
 * @param {string} input The string to normalise.
 * @return {string} The normalised string.
 */
export function normalise(input) {
  return removeAccents(input).trim().toLowerCase();
}
