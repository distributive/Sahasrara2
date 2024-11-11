/**
 * A utility module for handling errors.
 *
 * @file   This files defines the error utility module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { formatNow } from "./time.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * Prints an error to the console.
 * For use with catch(), e.g. asyncFunc.catch(logError).
 *
 * @param {Object} error The error caught to be logged.
 */
export function logError(error) {
  console.error(
    "--------------------------------------------------------------------------------"
  );
  console.error(`-- Error caught at ${formatNow()}`);
  console.error(
    "--------------------------------------------------------------------------------"
  );
  console.error();
  console.error(error);
  console.error();
}
