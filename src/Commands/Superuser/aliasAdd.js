/**
 * A secret command for adding aliases.
 *
 * @file   This files defines the aliasAdd command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { addAlias, applyAlias, saveAliases } from "../../Netrunner/aliases.js";
import {
  denormaliseCardTitle,
  searchNormalisedCardTitles,
} from "../../Netrunner/api.js";
import { normalise } from "../../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("add_alias")
  .setDescription("adds an alias for a given card")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) =>
    option
      .setName("alias")
      .setDescription("the alias to map to a card")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("card")
      .setDescription("the card the alias will map to")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("can_group")
      .setDescription("whether the alias can be a group alias")
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
  const cardName = interaction.options.getString("card");
  const canGroup = interaction.options.getBoolean("can_group");
  const success = addAlias(alias, cardName, canGroup);

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
      .setDescription(`\`${alias}\` is already an alias for that card.`)
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
