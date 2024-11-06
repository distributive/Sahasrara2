/**
 * A utility module for accessing .env variables.
 *
 * @file   This files defines the env utility module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

/**
 * Fetches a bool value, interpreting some values as false (case insensitive):
 * - "0"
 * - 0
 * - "false"
 * - "f"
 *
 * @param {string} varName The name of the variable to find and evaluate.
 * @return {bool} If that variable should be read as true or false.
 */
export function readBool(varName) {
  const raw = process.env[varName];
  if (!raw) {
    return false;
  }
  const val = String(raw);
  return !(val === "0" || val === "false" || val === "f");
}
