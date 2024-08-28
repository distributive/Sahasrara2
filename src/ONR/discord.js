/**
 * A module for supporting the Discord-specific display of ONR elements.
 *
 * @file   This files defines the ONR/discord module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {string} rarity An ONR card rarity.
 * @return {int} The hex code of the faction's color.
 */
function rarityToColor(rarity) {
  let color = process.env.COLOR_ERROR;
  switch (rarity) {
    case "Vital":
      color = process.env.COLOR_ONR_VITAL;
      break;
    case "Common":
      color = process.env.COLOR_ONR_COMMON;
      break;
    case "Uncommon":
      color = process.env.COLOR_ONR_UNCOMMON;
      break;
    case "Rare":
      color = process.env.COLOR_ONR_RARE;
      break;
  }
  return +color;
}

/**
 * @param {string} text Unedited ONR card text.
 * @return {string} The formatted text with emoji and formatting added.
 */
function formatText(text) {
  return text
    .replace(/<\/?strong>/g, "**")
    .replace(/<\/?em>/g, "*")
    .replaceAll("[bit]", process.env.EMOJI_ONR_BIT)
    .replaceAll("[ability]", process.env.EMOJI_ONR_ABILITY)
    .replaceAll("[subroutine]", process.env.EMOJI_ONR_SUBROUTINE)
    .replaceAll("[trash]", process.env.EMOJI_ONR_TRASH);
}

///////////////////////////////////////////////////////////////////////////////

export default {
  rarityToColor,
  formatText,
};
