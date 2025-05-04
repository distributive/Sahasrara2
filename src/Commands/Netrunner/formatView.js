/**
 * A command for viewing a single Netrunner format.
 *
 * @file   This files defines the view_format command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import * as api from "../../Netrunner/api.js";

///////////////////////////////////////////////////////////////////////////////

const FORMATS_DESCRIPTION = `The three main official formats are **Standard**, **Startup**, and **Eternal**.
- **Standard** is the main format used in tournament play, and includes a large rotating pool of cards.
- **Startup** is a smaller format including the most recent cycle(s) and the core sets.
- **Eternal** is an unrotating format containing every set ever released for Standard play.

There are other formats for play, some supported in some capacity by Null Signal Games, and other supported by the playerbase. For more information, check out the [NSG website](https://nullsignal.games/players/supported-formats/).`;

///////////////////////////////////////////////////////////////////////////////

const STANDARD_DESCRIPTION =
  "The flagship format of Netrunner Organized Play. This is the main format played at tournaments.";
const STARTUP_DESCRIPTION = `Startup is a limited-cardpool format, intended for new players taking their first steps into Organized Play as well as experienced players who want a slimmed-down deckbuilding challenge.

The cardpool for Startup consists of:
- System Gateway and System Update 2021
- The most recent complete Null Signal narrative cycle
- All sets in the current incomplete Null Signal narrative cycle (if any)`;
const ETERNAL_DESCRIPTION =
  "Eternal is not affected by rotation and has a far less restrictive list governing it. The largest and most complex format, it encompasses nearly the entirety of the printed card pool and only grows larger with time.";
const DESCRIPTIONS = {
  standard: STANDARD_DESCRIPTION,
  startup: STARTUP_DESCRIPTION,
  eternal: ETERNAL_DESCRIPTION,
};

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("view_format")
  .setDescription("view a specific Netrunner format")
  .addStringOption((option) =>
    option
      .setName("format_name")
      .setDescription("the format to display info on")
      .setChoices([
        { name: "Standard", value: "standard" },
        { name: "Startup", value: "startup" },
        { name: "Eternal", value: "eternal" },
      ])
  );

const meta = {};

async function execute(interaction, client) {
  const formatId = interaction.options.getString("format_name");
  let embed;

  // Format specified
  if (formatId) {
    const format = api.getFormat(formatId.toLowerCase());

    // Get active (and latest) restriction
    let restrictions = [];
    api.getFormatSnapshots(format.id).forEach((snapshot) => {
      if (!restrictions.includes(snapshot.attributes.restriction_id)) {
        restrictions.push(snapshot.attributes.restriction_id);
      }
    });

    let banlistText =
      "**Banlist: **" +
      api.getRestriction(format.attributes.active_restriction_id).attributes
        .name;
    if (
      format.attributes.active_restriction_id !=
      format.attributes.restriction_ids[
        format.attributes.restriction_ids.length
      ]
    ) {
      const latestRestriction = api.getRestriction(
        format.attributes.restriction_ids[
          format.attributes.restriction_ids.length - 1
        ]
      );
      banlistText +=
        "\n**Pending banlist: **" +
        latestRestriction.attributes.name +
        ` (starts ${latestRestriction.attributes.date_start})`;
    }

    // Get the card pool of the format
    const cardPool = api.getCardPool(format.attributes.active_card_pool_id);
    const cycles = cardPool.attributes.card_cycle_ids
      .map((cycleId) => api.getCardCycle(cycleId))
      .sort((a, b) =>
        a.attributes.date_release < b.attributes.date_release ? 1 : -1
      )
      .map((cycle) => {
        const formattedCycle = `**${cycle.attributes.name}**`;
        const relevantSets = cycle.attributes.card_set_ids
          .filter((id) => api.isCardSetInCardPool(id, cardPool.id))
          .map((id) => api.getCardSet(id))
          .reverse();
        const formattedSets = relevantSets
          .map((set) => `- ${set.attributes.name}`)
          .join("\n");
        return relevantSets.length > 1
          ? `${formattedCycle}\n${formattedSets}`
          : formattedCycle;
      });

    // Split the list roughly in thirds
    const characterLength = cycles.reduce(
      (length, cycle) => length + cycle.length,
      0
    );

    let i = 0;
    let cumLength = 0;
    for (; i < cycles.length && cumLength < characterLength / 3; i++) {
      cumLength += cycles[i].length;
    }
    const thirdIndex = i;
    for (; i < cycles.length && cumLength < (characterLength * 2) / 3; i++) {
      cumLength += cycles[i].length;
    }
    const twoThirdsIndex = i;

    const chunks = [
      cycles.slice(0, thirdIndex),
      cycles.slice(thirdIndex, twoThirdsIndex),
      cycles.slice(twoThirdsIndex, cycles.length),
    ];
    const [cardPoolTextA, cardPoolTextB, cardPoolTextC] = chunks.map((chunk) =>
      chunk.join("\n")
    );

    // Build the embed
    const titleText = format.attributes.name;
    const descriptionText = DESCRIPTIONS[format.id] + "\n\n" + banlistText;

    embed = new EmbedBuilder()
      .setTitle(`:card_box:  ${titleText}`)
      .setDescription(descriptionText)
      .addFields({
        name: "Legal Sets",
        value: cardPoolTextA,
        inline: true,
      })
      .addFields({
        name: "_ _",
        value: cardPoolTextB,
        inline: true,
      })
      .addFields({
        name: "_ _",
        value: cardPoolTextC,
        inline: true,
      })
      .setColor(+process.env.COLOR_INFO);
  }
  // No format specified
  else {
    embed = new EmbedBuilder()
      .setTitle(`:card_box:  Official Play Formats`)
      .setDescription(FORMATS_DESCRIPTION)
      .setFooter({
        text: "Use e.g. /view_format Standard to view the card pool of a format.",
      })
      .setColor(+process.env.COLOR_INFO);
  }

  await interaction.reply({ embeds: [embed] });
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
