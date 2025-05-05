/**
 * A command for searching the comprehensive rules.
 *
 * @file   This files defines the search_rules command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { truncate } from "../../Utility/text.js";
import { searchRules } from "../../Rules/api.js";
import { createRuleEmbed } from "../../Rules/embed.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("search_rule")
  .setDescription("search the Netrunner Comprehensive Rules document")
  .addStringOption((option) =>
    option.setName("query").setDescription("the search query").setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const query = interaction.options.getString("query");
  const results = searchRules(query);

  if (!results.length) {
    const embed = new EmbedBuilder()
      .setTitle("No Results!")
      .setURL(process.env.RULES_URL)
      .setDescription(`No rule could be found with that query.`)
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  } else if (results.length == 1) {
    const embed = createRuleEmbed();
    await interaction.deferReply({});
    await interaction.editReply({ embeds: [embed] });
  } else {
    const lines = results
      .slice(0, 10)
      .map((rule) => `- \`${rule.nr}\` - ${truncate(rule.text, 50, "…")}`)
      .join("\n");
    const descriptionText =
      lines +
      (results.length > 10 ? `\n- _…and ${results.length - 10} more._` : "");
    const embed = new EmbedBuilder()
      .setTitle(":triangular_ruler: Results")
      .setURL(process.env.RULES_URL)
      .setDescription(descriptionText)
      .setColor(+process.env.COLOR_INFO)
      .setFooter({
        text: "Follow the link in the title to view the complete Comprehensive Rules document.",
      });
    await interaction.deferReply({});
    await interaction.editReply({ embeds: [embed] });
  }
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
