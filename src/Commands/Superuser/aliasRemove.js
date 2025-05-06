/**
 * A secret command for removing aliases.
 *
 * @file   This files defines the aliasRemove command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { removeAlias, saveAliases } from "../../Netrunner/aliases.js";
import { normalise } from "../../Utility/text.js";
import {
  denormaliseCardTitle,
  searchNormalisedCardTitles,
} from "../../Netrunner/api.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("remove_alias")
  .setDescription("removes an alias from the alias pool")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("alias")
      .setDescription("the alias to remove")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("card")
      .setDescription("the card the alias will map to")
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

  const alias = interaction.options.getString("alias");
  const card = interaction.options.getString("card");
  const success = removeAlias(alias, card);

  let embed;
  if (success) {
    embed = new EmbedBuilder()
      .setTitle("Alias removed!")
      .setDescription(
        card
          ? `\`${alias}\` is no longer an alias for that card.`
          : `\`${alias}\` is no longer an alias.`
      )
      .setColor(+process.env.COLOR_INFO);
    saveAliases();
  } else {
    embed = new EmbedBuilder()
      .setTitle("Alias does not exist!")
      .setDescription(
        card
          ? `\`${alias}\` is not an alias for that card.`
          : `The alias \`${alias}\` cannot be found.`
      )
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

export default { data, meta, execute, autocomplete };
