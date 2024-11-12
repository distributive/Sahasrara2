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

/**
 * Normalises a string and replaces whitespace with an underscore, for use as an ID.
 *
 * @param {string} input The string to convert.
 * @return {string} The string in ID form.
 */
export function readId(input) {
  return normalise(input)
    .replace(/[^a-zA-Z0-9 .&/-]/g, "") // Remove invalid characters
    .replace(/[^a-zA-Z0-9]/g, " ") // Convert non-alphanumerics to whitespace (will be converted to underscores later)
    .trim() // Trim to prevent leading/trailing underscores
    .replace(/ +/g, "_"); // Convert whitespace to underscores
}
