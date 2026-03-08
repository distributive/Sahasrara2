/**
 * A secret command for viewing a card's aliases.
 *
 * @file   This files defines the aliasView command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { listAliases } from "./../../Netrunner/aliases.js";
import {
  denormaliseCardTitle,
  fetchPrinting,
  getClosestCard,
  searchNormalisedCardTitles,
} from "./../../Netrunner/api.js";
import { factionToColor } from "./../../Netrunner/discord.js";
import { normalise } from "../../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_aliases")
  .setDescription("displays all aliases of a given card")
  .addStringOption((option) =>
    option
      .setName("card")
      .setDescription("the card to view")
      .setRequired(true)
      .setAutocomplete(true)
  );

async function execute(interaction, client) {
  const cardName = interaction.options.getString("card");
  const closestCard = await getClosestCard(cardName);
  const latestPrinting = await fetchPrinting(
    closestCard.attributes.latest_printing_id
  );
  const aliases = listAliases(closestCard.attributes.title);

  let embed;
  if (aliases && aliases.length > 0) {
    const description = `The aliases for ${
      closestCard.attributes.title
    }:\n - ${aliases.join("\n- ")}`;
    embed = new EmbedBuilder()
      .setColor(factionToColor(latestPrinting.attributes.faction_id))
      .setTitle("Aliases!")
      .setDescription(description)
      .setThumbnail(latestPrinting.attributes.images.nrdb_classic.large);
  } else {
    embed = new EmbedBuilder()
      .setTitle("No aliases found!")
      .setDescription(`\`${closestCard.attributes.title}\` has no aliases.`)
      .setColor(+process.env.COLOR_ERROR);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function autocomplete(interaction) {
  const focusedValue = normalise(interaction.options.getFocused());
  const validChoices = searchNormalisedCardTitles(focusedValue)
    .slice(0, 25)
    .map((title) => ({ name: denormaliseCardTitle(title), value: title }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, execute, autocomplete };
