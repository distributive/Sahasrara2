/**
 * A secret command for adding aliases.
 *
 * @file   This files defines the aliasAdd command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { addAlias, applyAlias, saveAliases } from "../../Netrunner/aliases.js";

///////////////////////////////////////////////////////////////////////////////

const data = {
  name: "addalias",
  description: "adds an alias for a given card",
  default_member_permisions: "" + PermissionFlagsBits.Administrator,
  dm_permissions: "0",
  hideFromHelp: true,
  options: [
    {
      name: "alias",
      description: "the alias to map to a card",
      type: 3,
      required: true,
    },
    {
      name: "card",
      description: "the card the alias will map to",
      type: 3,
      required: true,
    },
  ],
};
async function execute(interaction, client) {
  const alias = interaction.options.getString("alias");
  const cardName = interaction.options.getString("card");
  const success = addAlias(alias, cardName); // TODO: check if card name exists and offer corrections

  let embed;
  if (success) {
    embed = new EmbedBuilder()
      .setTitle("Alias added!")
      .setDescription(`\`${alias}\` ⇒ \`${cardName}\``)
      .setColor(+process.env.COLOR_INFO);
    saveAliases();
  } else {
    embed = new EmbedBuilder()
      .setTitle("Alias already exists!")
      .setDescription(
        `\`${alias}\` is already an alias for \`${applyAlias(alias)}\`.`
      )
      .setColor(+process.env.COLOR_ERROR);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, execute };
