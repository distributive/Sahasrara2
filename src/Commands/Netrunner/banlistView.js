/**
 * A command for viewing user documentation for the bot.
 *
 * @file   This files defines the help command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { normalise, numberToEmote, truncate } from "../../Utility/text.js";
import {
  fetchCard,
  getActiveRestriction,
  getAllRestrictions,
  getRestriction,
} from "../../Netrunner/api.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_banlist")
  .setDescription("view a specific banlist")
  .addStringOption((option) =>
    option
      .setName("banlist_name")
      .setDescription("the banlist to view")
      .setAutocomplete(true)
      .setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const restrictionId = interaction.options.getString("banlist_name");
  const restriction =
    restrictionId == "active_standard"
      ? getActiveRestriction("standard")
      : restrictionId == "active_startup"
      ? getActiveRestriction("startup")
      : restrictionId == "active_eternal"
      ? getActiveRestriction("eternal")
      : getRestriction(restrictionId);

  if (!restriction) {
    const embed = new EmbedBuilder()
      .setTitle("Unknown Banlist!")
      .setDescription(`"${restrictionId}" does not match any known banlist.`)
      .setColor(+process.env.COLOR_ERROR);

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // Split the affected cards by side
  const banned = [[], []];
  const restricted = [[], []];
  const ufc = [{}, {}];
  const penalty = [[], []];
  const points = [{}, {}];

  // Banned
  if (restriction.attributes.verdicts.banned) {
    for (const cardId of restriction.attributes.verdicts.banned) {
      const card = await fetchCard(cardId);
      if (card.attributes.side_id == "corp") {
        banned[0].push(
          `:no_entry_sign: ${truncate(card.attributes.title, 30, "…")}`
        );
      } else {
        banned[1].push(
          `:no_entry_sign: ${truncate(card.attributes.title, 30, "…")}`
        );
      }
    }
  }

  // Restricted
  if (restriction.attributes.verdicts.restricted) {
    for (const cardId of restriction.attributes.verdicts.restricted) {
      const card = await fetchCard(cardId);
      if (card.attributes.side_id == "corp") {
        restricted[0].push(
          `:unicorn: ${truncate(card.attributes.title, 30, "…")}`
        );
      } else {
        restricted[1].push(
          `:unicorn: ${truncate(card.attributes.title, 30, "…")}`
        );
      }
    }
  }

  // Universal faction cost
  if (restriction.attributes.verdicts.universal_faction_cost) {
    for (const [cardId, count] of Object.entries(
      restriction.attributes.verdicts.universal_faction_cost
    )) {
      const card = await fetchCard(cardId);
      if (card.attributes.side_id == "corp") {
        if (!ufc[0][count]) {
          ufc[0][count] = [];
        }
        ufc[0][count].push(
          `${numberToEmote(count)} ${truncate(card.attributes.title, 30, "…")}`
        );
      } else {
        if (!ufc[1][count]) {
          ufc[1][count] = [];
        }
        ufc[1][count].push(
          `${numberToEmote(count)} ${truncate(card.attributes.title, 30, "…")}`
        );
      }
    }
  }

  // Global penalty
  if (restriction.attributes.verdicts.global_penalty) {
    for (const cardId of restriction.attributes.verdicts.global_penalty) {
      const card = await fetchCard(cardId);
      if (card.attributes.side_id == "corp") {
        penalty[0].push(`:one: ${truncate(card.attributes.title, 30, "…")}`);
      } else {
        penalty[1].push(`:one: ${truncate(card.attributes.title, 30, "…")}`);
      }
    }
  }

  // Points
  if (restriction.attributes.verdicts.points) {
    for (const [cardId, count] of Object.entries(
      restriction.attributes.verdicts.points
    )) {
      const card = await fetchCard(cardId);
      if (card.attributes.side_id == "corp") {
        if (!points[0][count]) {
          points[0][count] = [];
        }
        points[0][count].push(
          `${numberToEmote(count)} ${truncate(card.attributes.title, 30, "…")}`
        );
      } else {
        if (!points[1][count]) {
          points[1][count] = [];
        }
        points[1][count].push(
          `${numberToEmote(count)} ${truncate(card.attributes.title, 30, "…")}`
        );
      }
    }
  }

  // Format each section
  const fields = [];

  // Banned
  if (banned[0].length || banned[1].length) {
    fields.push({
      name: "Banned",
      value: "_ _",
    });
    fields.push({
      name: "Corp Cards",
      value: banned[0].length ? banned[0].join("\n") : "_ _",
      inline: true,
    });
    fields.push({
      name: "Runner Cards",
      value: banned[1].length ? banned[1].join("\n") : "_ _",
      inline: true,
    });
  }

  // Restricted
  if (restricted[0].length || restricted[1].length) {
    fields.push({
      name: "Restricted",
      value: "_ _",
    });
    fields.push({
      name: "Corp Cards",
      value: restricted[0].length ? restricted[0].join("\n") : "_ _",
      inline: true,
    });
    fields.push({
      name: "Runner Cards",
      value: restricted[1].length ? restricted[1].join("\n") : "_ _",
      inline: true,
    });
  }

  // Universal faction cost
  if (Object.keys(ufc[0]).length || Object.keys(ufc[1]).length) {
    const corpPoints = Object.keys(ufc[0]);
    const runnerPoints = Object.keys(ufc[1]);
    corpPoints.reverse();
    runnerPoints.reverse();
    const lines = [[], []];
    corpPoints.forEach((pointValue) => {
      ufc[0][pointValue].forEach((card) => {
        lines[0].push(card);
      });
    });
    runnerPoints.forEach((pointValue) => {
      ufc[1][pointValue].forEach((card) => {
        lines[1].push(card);
      });
    });
    fields.push({
      name: "Universal faction cost",
      value: "_ _",
    });
    fields.push({
      name: "Corp Cards",
      value: lines[0].length ? lines[0].join("\n") : "_ _",
      inline: true,
    });
    fields.push({
      name: "Runner Cards",
      value: lines[1].length ? lines[1].join("\n") : "_ _",
      inline: true,
    });
  }

  // Global penalty
  if (penalty[0].length || penalty[1].length) {
    fields.push({
      name: "Global Penalty",
      value: "_ _",
    });
    fields.push({
      name: "Corp Cards",
      value: penalty[0].length ? penalty[0].join("\n") : "_ _",
      inline: true,
    });
    fields.push({
      name: "Runner Cards",
      value: penalty[1].length ? penalty[1].join("\n") : "_ _",
      inline: true,
    });
  }

  // Points
  if (Object.keys(points[0]).length || Object.keys(points[1]).length) {
    const corpPoints = Object.keys(points[0]);
    const runnerPoints = Object.keys(points[1]);
    corpPoints.reverse();
    runnerPoints.reverse();
    const lines = [[], []];
    corpPoints.forEach((pointValue) => {
      points[0][pointValue].forEach((card) => {
        lines[0].push(card);
      });
    });
    runnerPoints.forEach((pointValue) => {
      points[1][pointValue].forEach((card) => {
        lines[1].push(card);
      });
    });
    fields.push({
      name: "Points",
      value: "_ _",
    });
    fields.push({
      name: "Corp Cards",
      value: lines[0].length ? lines[0].join("\n") : "_ _",
      inline: true,
    });
    fields.push({
      name: "Runner Cards",
      value: lines[1].length ? lines[1].join("\n") : "_ _",
      inline: true,
    });
  }

  // Construct embed
  let descriptionText = `**Start date:** ${restriction.attributes.date_start}`;
  if (restriction.attributes.point_limit != null) {
    descriptionText += `\n**Point limit:** ${restriction.attributes.point_limit}`;
  }
  const embed = new EmbedBuilder()
    .setTitle(":octagonal_sign: " + restriction.attributes.name)
    .setDescription(descriptionText)
    .setColor(+process.env.COLOR_INFO)
    .addFields(fields);

  await interaction.deferReply({});
  await interaction.editReply({ embeds: [embed] });
}

async function autocomplete(interaction, client) {
  const focusedValue = normalise(interaction.options.getFocused()).trim();
  const restrictions =
    focusedValue == ""
      ? Object.values(getAllRestrictions())
      : Object.values(getAllRestrictions()).filter((restriction) =>
          normalise(restriction.attributes.name).includes(focusedValue)
        );
  restrictions.reverse();
  const validChoices = restrictions.slice(0, 22).map((restriction) => ({
    name: restriction.attributes.name,
    value: restriction.id,
  }));
  validChoices.unshift({ name: "Current Eternal", value: "active_eternal" });
  validChoices.unshift({ name: "Current Startup", value: "active_startup" });
  validChoices.unshift({ name: "Current Standard", value: "active_standard" });
  await interaction.respond(validChoices);
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute, autocomplete };
