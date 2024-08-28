/**
 * A command for identifying a player's mark (HQ, R&D, or Archives).
 *
 * @file   This files defines the mark function module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";

///////////////////////////////////////////////////////////////////////////////

export const data = {
  name: "mark",
  description: "identifies your mark",
  dm_permissions: "0",
};
export async function execute(interaction, client) {
  const random = Math.floor(Math.random() * 3);
  const server = random == 0 ? "HQ" : random == 1 ? "R&D" : "Archives";
  const color =
    random == 0
      ? +process.env.COLOR_HQ
      : random == 1
      ? +process.env.COLOR_RND
      : +process.env.COLOR_ARCHIVES;

  const embed = new EmbedBuilder()
    .setTitle(":game_die: Result :game_die:")
    .setDescription(`**Your mark is:** ${server}`)
    .setColor(color);

  await interaction.reply({ embeds: [embed] });
}
