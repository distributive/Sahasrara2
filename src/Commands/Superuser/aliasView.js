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
  denomraliseCardTitle,
  fetchPrinting,
  getClosestCard,
  searchNormalisedCardTitles,
} from "./../../Netrunner/api.js";
import { factionToColor } from "./../../Netrunner/discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_aliases")
  .setDescription("displays all aliases of a given card")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("card")
      .setDescription("the card to view")
      .setRequired(true)
      .setAutocomplete(true)
  );

const meta = {
  hideFromHelp: true,
};

async function execute(interaction, client) {
  // Verify superuser status - TODO: create permissions module
  if (interaction.user.id != process.env.SUPER_USER) {
    const embed = new EmbedBuilder()
      .setTitle("Invalid permissions!")
      .setDescription(
        `You do not have permission to use this command, but you are seeing it because Discord does not allow any commands to be hidden from admnistrators.`
      )
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

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
      .setThumbnail(latestPrinting.attributes.images.nrdb_classic.medium);
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
    .map((title) => ({ name: denomraliseCardTitle(title), value: title }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
