/**
 * A command for identifying a player's mark (HQ, R&D, or Archives).
 *
 * @file   This files defines the mark command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { randomInt } from "../Utility/random.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("mark")
  .setDescription("identifies your mark");

const meta = {};

async function execute(interaction, client) {
  const random = randomInt(0, 3);
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

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
