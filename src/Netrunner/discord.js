/**
 * A module for supporting the Discord-specific display of Netrunner elements.
 *
 * @file   This files defines the Netrunner/discord module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {string} factionId The faction's ID.
 * @return {int} The hex code of the faction's color.
 */
function factionToColor(factionId) {
  let color = process.env.COLOR_ERROR;
  switch (factionId) {
    case "anarch":
      color = process.env.COLOR_ANARCH;
      break;
    case "criminal":
      color = process.env.COLOR_CRIMINAL;
      break;
    case "shaper":
      color = process.env.COLOR_SHAPER;
      break;

    case "haas_bioroid":
      color = process.env.COLOR_HAAS_BIOROID;
      break;
    case "jinteki":
      color = process.env.COLOR_JINTEKI;
      break;
    case "nbn":
      color = process.env.COLOR_NBN;
      break;
    case "weyland_consortium":
      color = process.env.COLOR_WEYLAND_CONSORTIUM;
      break;

    case "neutral_runner":
      color = process.env.COLOR_NEUTRAL_RUNNER;
      break;
    case "neutral_corp":
      color = process.env.COLOR_NEUTRAL_CORP;
      break;

    case "adam":
      color = process.env.COLOR_ADAM;
      break;
    case "apex":
      color = process.env.COLOR_APEX;
      break;
    case "sunny_lebeau":
      color = process.env.COLOR_SUNNY_LEBEAU;
      break;
  }
  return +color;
}

/**
 * @param {string} factionId The faction's ID.
 * @return {string} The emoji code for that faction's icon.
 */
function factionToEmote(factionId) {
  switch (factionId) {
    case "anarch":
      return process.env.EMOJI_ANARCH;
    case "criminal":
      return process.env.EMOJI_CRIMINAL;
    case "shaper":
      return process.env.EMOJI_SHAPER;

    case "haas_bioroid":
      return process.env.EMOJI_HAAS_BIOROID;
    case "jinteki":
      return process.env.EMOJI_JINTEKI;
    case "nbn":
      return process.env.EMOJI_NBN;
    case "weyland_consortium":
      return process.env.EMOJI_WEYLAND_CONSORTIUM;

    case "adam":
      return process.env.EMOJI_ADAM;
    case "apex":
      return process.env.EMOJI_APEX;
    case "sunny_lebeau":
      return process.env.EMOJI_SUNNY_LEBEAU;

    default:
      return process.env.EMOJI_NETRUNNER; // Neutral corp/runner
  }
}

/**
 * @param {string} factionId The faction's ID.
 * @return {string} The image link for that faction's icon.
 */
function factionToImage(factionId) {
  switch (factionId) {
    case "anarch":
      return process.env.IMAGE_ANARCH;
    case "criminal":
      return process.env.IMAGE_CRIMINAL;
    case "shaper":
      return process.env.IMAGE_SHAPER;

    case "haas_bioroid":
      return process.env.IMAGE_HAAS_BIOROID;
    case "jinteki":
      return process.env.IMAGE_JINTEKI;
    case "nbn":
      return process.env.IMAGE_NBN;
    case "weyland_consortium":
      return process.env.IMAGE_WEYLAND_CONSORTIUM;

    case "adam":
      return process.env.IMAGE_ADAM;
    case "apex":
      return process.env.IMAGE_APEX;
    case "sunny_lebeau":
      return process.env.IMAGE_SUNNY_LEBEAU;

    default:
      return process.env.IMAGE_NETRUNNER; // Neutral corp/runner
  }
}

/**
 * @param {string} text Unedited card text from the card API.
 * @return {string} The formatted text with emoji and formatting added.
 */
function formatText(text) {
  return text
    .replace(/<\/?strong>/g, "**")
    .replace(/<\/?em>/g, "*")
    .replaceAll("[credit]", process.env.EMOJI_CREDIT)
    .replaceAll("[click]", process.env.EMOJI_CLICK)
    .replaceAll("[recurring-credit]", process.env.EMOJI_RECURRING_CREDIT)
    .replaceAll("[link]", process.env.EMOJI_LINK)
    .replaceAll("[mu]", process.env.EMOJI_MU)
    .replaceAll("[interrupt]", process.env.EMOJI_INTERRUPT)
    .replaceAll("[subroutine]", process.env.EMOJI_SUBROUTINE)
    .replaceAll("[trash]", process.env.EMOJI_TRASH_ABILITY)
    .replaceAll("[anarch]", factionToEmote("anarch"))
    .replaceAll("[criminal]", factionToEmote("criminal"))
    .replaceAll("[shaper]", factionToEmote("shaper"))
    .replaceAll("[haas-bioroid]", factionToEmote("haas_bioroid"))
    .replaceAll("[jinteki]", factionToEmote("jinteki"))
    .replaceAll("[nbn]", factionToEmote("nbn"))
    .replaceAll("[weyland-consortium]", factionToEmote("weyland_consortium"));
}

///////////////////////////////////////////////////////////////////////////////

export { factionToColor, factionToEmote, factionToImage, formatText };
