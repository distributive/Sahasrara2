/**
 * A utility module for handling times and dates.
 *
 * @file   This files defines the time utility module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

/**
 * Formats the current date and time into a human-readable string.
 *
 * @return {string} The current time, formatted nicely.
 */
export function formatNow() {
  const now = new Date();
  const hours = formatTime(now.getHours());
  const minutes = formatTime(now.getMinutes());
  const seconds = formatTime(now.getSeconds());

  return `${now.toDateString()} ${hours}:${minutes}:${seconds}`;
}

///////////////////////////////////////////////////////////////////////////////

/**
 * If a number is less than 10, add a leading 0.
 *
 * @param {int} number The date/time number to be formatted.
 * @return {string} That number as a string, with a leading 0 if required.
 */
function formatTime(number) {
  return number < 10 ? "0" + number : number;
}
