/**
 * A secret command for removing aliases.
 *
 * @file   This files defines the aliasRemove command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { removeAlias, saveAliases } from "../../Netrunner/aliases.js";

///////////////////////////////////////////////////////////////////////////////

const data = {
  name: "removealias",
  description: "removes an alias from the alias pool",
  default_member_permisions: "" + PermissionFlagsBits.Administrator,
  dm_permissions: "0",
  hideFromHelp: true,
  options: [
    {
      name: "alias",
      description: "the alias to remove",
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

  const alias = interaction.options.getString("alias");
  const success = removeAlias(alias);

  let embed;
  if (success) {
    embed = new EmbedBuilder()
      .setTitle("Alias removed!")
      .setDescription(`\`${alias}\` is no longer an alias.`)
      .setColor(+process.env.COLOR_INFO);
    saveAliases();
  } else {
    embed = new EmbedBuilder()
      .setTitle("Alias does not exist!")
      .setDescription(`The alias \`${alias}\` cannot be found.`)
      .setColor(+process.env.COLOR_ERROR);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, execute };
