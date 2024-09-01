/**
 * A secret command for viewing a card's aliases.
 *
 * @file   This files defines the aliasView command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { listAliases } from "./../../Netrunner/aliases.js";
import { fetchPrinting, getClosestCard } from "./../../Netrunner/api.js";
import { factionToColor } from "./../../Netrunner/discord.js";

///////////////////////////////////////////////////////////////////////////////

const data = {
  name: "viewaliases",
  description: "view all aliases of a given card",
  default_member_permisions: "" + PermissionFlagsBits.Administrator,
  dm_permissions: "0",
  hideFromHelp: true,
  options: [
    {
      name: "card",
      description: "the card to view",
      type: 3,
      required: true,
    },
  ],
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
  if (aliases) {
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

///////////////////////////////////////////////////////////////////////////////

export default { data, execute };
