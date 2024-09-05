/**
 * A utility module for functions that modify strings.
 *
 * @file   This files defines the text utility module.
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
