/**
 * A utility module for randomisation functions.
 *
 * @file   This files defines the random utility module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

/**
 * Get a random integer between a minimum (inclusive) and maximum (exclusive).
 *
 * @param {number} min The minimum value (inclusive) the output can be.
 * @param {number} max The maximum value (exclusive) the output can be.
 * @return {int} A random integer within the specified bounds.
 */
export function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

/**
 * Get a random index belonging to an array.
 *
 * @param {[*]} array The array to pick a random index.
 * @return {int} A random index of the given array.
 */
export function randomIndex(array) {
  return Math.floor(Math.random() * array.length);
}

/**
 * Get a random element from an array.
 *
 * @param {[*]} array The array to pick a random element of.
 * @return {*} A random element of the given array.
 */
export function randomElement(array) {
  return array[randomIndex(array)];
}
