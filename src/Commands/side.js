/**
 * A command for randomly selecting a side for a player to play as (corp or runner).
 *
 * @file   This files defines the side command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("side")
  .setDescription("picks a side at random")
  .addUserOption((option) =>
    option.setName("opponent").setDescription("specify your opponent")
  );

const meta = {};

async function execute(interaction, client) {
  const opponent = interaction.options.getUser("opponent");
  const userIsCorp = Math.floor(Math.random() * 2) == 0;
  const color = userIsCorp
    ? +process.env.COLOR_CORP
    : +process.env.COLOR_RUNNER;

  let message;
  if (userIsCorp) {
    message = `You will corp.\n${
      opponent ? opponent : "Your opponent"
    } will run.`;
  } else {
    message = `You will run.\n${
      opponent ? opponent : "Your opponent"
    } will corp.`;
  }

  const embed = new EmbedBuilder()
    .setTitle(":game_die: Result :game_die:")
    .setDescription(message)
    .setColor(color);

  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
