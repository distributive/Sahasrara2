/**
 * A module for building Netrunner-based Discord embeds.
 *
 * @file   This files defines the Netrunner/embed module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder } from "discord.js";
import { getRule } from "./api.js";
import { truncate } from "../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} rule A rule.
 * @return {Object} A Discord embed displaying the rule.
 */
export function createRuleEmbed(rule) {
  const shortRule = rule.type == "section" && rule.text.length <= 32;
  const children =
    !rule.children || !rule.children.length
      ? ""
      : (shortRule ? "" : "\n\n**Subsections**\n") +
        rule.children
          .map((ruleId) => {
            const rule = getRule(ruleId);
            return `- \`${rule.nr}\` - ${truncate(rule.text, 50, "…")}`;
          })
          .join("\n");
  const titleText = rule.nr + (shortRule ? ` - ${rule.text}` : "");
  const descriptionText = shortRule ? children : rule.text + children;

  const embed = new EmbedBuilder()
    .setTitle(":triangular_ruler: " + titleText)
    .setURL(`${process.env.RULES_URL}?r=${rule.id}`)
    .setDescription(descriptionText)
    .setColor(+process.env.COLOR_INFO)
    .setFooter({
      text: "Follow the link in the title to view the complete Comprehensive Rules document.",
    });
  return embed;
}
