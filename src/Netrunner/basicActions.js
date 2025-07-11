/**
 * A module for displaying the basic action cards.
 *
 * @file   This files defines the Netrunner/basicActionCard module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import { formatText } from "../Netrunner/discord.js";

///////////////////////////////////////////////////////////////////////////////

const CORP_BASIC_ACTIONS = `
  **[click]:** Gain 1[credit].
  **[click]:** Draw 1 card.
  **[click]:** Play 1 operation from HQ.
  **[click]:** Install 1 agenda/asset/upgrade/ice from HQ.
  **[click], 1[credit]:** Advance 1 installed card.
  **[click], 2[credit]:** Trash 1 installed resource. Take this action only if the Runner is tagged.
  **[click][click][click]:** Purge virus counters.
`;
const CORP_ALLOTTED_CLICKS = `You get 3 allotted clicks each turn.`;

const RUNNER_BASIC_ACTIONS = `
  **[click]:** Gain 1[credit].
  **[click]:** Draw 1 card.
  **[click]:** Play 1 event from your grip.
  **[click]:** Install 1 program/resource/hardware from your grip.
  **[click]:** Run any server.
  **[click], 2[credit]:** Remove 1 tag.
`;
const RUNNER_ALLOTTED_CLICKS = `You get 4 allotted clicks each turn.`;

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {bool} isCorp Whether to display the Corp or Runner basic action card.
 * @param {bool} includeText Whether to display as text with a thumbnail or just the fullsize image.
 */
export function createBasicActionEmbed(isCorp, includeText = true) {
  const image = isCorp
    ? process.env.IMAGE_BASIC_ACTIONS_CORP
    : process.env.IMAGE_BASIC_ACTIONS_RUNNER;

  const embed = new EmbedBuilder().setColor(
    isCorp ? +process.env.COLOR_CORP : +process.env.COLOR_RUNNER
  );

  if (includeText) {
    embed
      .setTitle(isCorp ? "Corp Basic Actions" : "Runner Basic Actions")
      .setDescription(
        formatText(isCorp ? CORP_BASIC_ACTIONS : RUNNER_BASIC_ACTIONS)
      )
      .setFooter({
        text: isCorp ? CORP_ALLOTTED_CLICKS : RUNNER_ALLOTTED_CLICKS,
      })
      .setThumbnail(image);
  } else {
    embed.setImage(image);
  }

  return embed;
}
