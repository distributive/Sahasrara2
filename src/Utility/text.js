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
 * Makes a string title case.
 *
 * @param {string} input The string to make title case.
 * @return {string} The title case string.
 */
export function toTitleCase(input) {
  return input.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
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

/**
 * Bounds a string to a given length.
 *
 * @param {string} input The string to truncate.
 * @param {string} maxLength The maximum length of the output string.
 * @param {string} suffix An optional character to replace the last character in shortened strings.
 * @return {string} The truncated string.
 */
export function truncate(input, maxLength, suffix) {
  suffix = suffix ? suffix : "";
  return input.length > maxLength
    ? input.substring(0, maxLength - suffix.length) + suffix
    : input;
}

/**
 * Converts a number into its emote.
 *
 * @param {int} input The number to convert.
 * @return {string} The number's emote.
 */
export function numberToEmote(input) {
  switch (input) {
    case 0:
      return ":zero:";
    case 1:
      return ":one:";
    case 2:
      return ":two:";
    case 3:
      return ":three:";
    case 4:
      return ":four:";
    case 5:
      return ":five:";
    case 6:
      return ":six:";
    case 7:
      return ":seven:";
    case 8:
      return ":eight:";
    case 9:
      return ":nine:";
    case 10:
      return ":keycap_ten:";
    default:
      return ":asterisk:";
  }
}
