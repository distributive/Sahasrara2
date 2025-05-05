/**
 * A command for viewing rules from the comprehensive rules.
 *
 * @file   This files defines the get_rule command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { normalise, truncate } from "../../Utility/text.js";
import { getAllNrs, getRuleFromNr } from "../../Rules/api.js";
import { createRuleEmbed } from "../../Rules/embed.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("get_rule")
  .setDescription("view a rule from the Netrunner Comprehensive Rules document")
  .addStringOption((option) =>
    option
      .setName("rule_id") // Actually it's the rule's nr value
      .setDescription("the rule to view")
      .setAutocomplete(true)
      .setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const nr = interaction.options.getString("rule_id");
  const rule = getRuleFromNr(nr);

  if (!rule) {
    const embed = new EmbedBuilder()
      .setTitle("Unknown Rule!")
      .setURL(process.env.RULES_URL)
      .setDescription(`"${nr}" does not match any known rule.`)
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = createRuleEmbed(rule);
  await interaction.deferReply({});
  await interaction.editReply({ embeds: [embed] });
}

async function autocomplete(interaction, client) {
  const focusedValue = normalise(interaction.options.getFocused()).trim();
  const nrs =
    focusedValue == ""
      ? getAllNrs()
      : getAllNrs().filter((nr) => nr.includes(focusedValue));
  const validChoices = nrs.slice(0, 25).map((nr) => ({
    name: `${nr} - ${truncate(getRuleFromNr(nr).text, 32, "…")}`,
    value: nr,
  }));
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
