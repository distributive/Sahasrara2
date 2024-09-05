/**
 * A string-searching utility module. Provides functions for finding matches
 * in string search spaces.
 *
 * @file   This files defines the fuzzySearch utility module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import dldist from "weighted-damerau-levenshtein";

///////////////////////////////////////////////////////////////////////////////

/**
 * The default weights for calculating Damerau-Levenstein distances. These
 * prioritise insertion as users are much more likely to provide shorter inputs
 * than the card title they expect.
 */
export const defaultOptions = {
  insWeight: 1,
  delWeight: 4,
  subWeight: 4,
  useDamerau: true,
};

///////////////////////////////////////////////////////////////////////////////

/**
 * Finds the closest match under the provided weightings (or the defaults if
 * none are provided) of a given string within an array of strings. Earlier
 * elements in the array are prioritised in the case of ties.
 *
 * @param {string} input The string to find the closest match to.
 * @param {string[]} pool The array of strings to search.
 * @return {string} The best match for the input from within the pool.
 */
export function bestMatch(input, pool, options) {
  options = options ? options : defaultOptions;
  return pool.reduce(
    function (prev, next) {
      const distance = dldist(input, next, options);
      return distance < prev[1] ? [next, distance] : prev;
    },
    ["", Infinity]
  )[0];
}
