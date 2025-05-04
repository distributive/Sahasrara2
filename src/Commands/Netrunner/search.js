/**
 * A command for searching for Netrunner cards.
 *
 * @file   This files defines the search command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fetchPrinting } from "../../Netrunner/api.js";
import { factionToEmote } from "../../Netrunner/discord.js";
import { createPrintingEmbed } from "../../Netrunner/embed.js";
import { truncate } from "../../Utility/text.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("search for Netrunner cards")
  .addStringOption((option) =>
    option
      .setName("search_query")
      .setDescription("the search query")
      .setRequired(true)
  );

const meta = {};

async function execute(interaction, client) {
  const query = interaction.options.getString("search_query");
  const queryURI = encodeURIComponent(query);
  const searchURL = `${process.env.SEARCH_URL}?search=${queryURI}`;
  const results = await fetchResults(
    `${process.env.SEARCH_URL}simple_api/?search=${queryURI}`
  );
  results.reverse();

  if (!results.length) {
    const embed = new EmbedBuilder()
      .setTitle(":wastebasket: No results found!")
      .setDescription(
        `You can check the [syntax guide](${process.env.SEARCH_URL}syntax) for potential errors in your query.`
      )
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed] });
    return;
  } else if (results.length == 1) {
    const printing = await fetchPrinting(results[0]);
    const embed = createPrintingEmbed(printing);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  const lines = [];
  for (let i = 0; i < 10 && i < results.length; i++) {
    const printingId = results[i];
    const printing = await fetchPrinting(printingId);
    lines.push(
      `${factionToEmote(printing.attributes.faction_id)} [${truncate(
        printing.attributes.title,
        30,
        "…"
      )}](${process.env.NRDB_URL}en/card/${printingId})`
    );
  }

  if (results.length > 10) {
    lines.push(`View all [${results.length} results](${searchURL}).`);
  }

  // Construct embed
  const embed = new EmbedBuilder()
    .setTitle(":mag_right: Results")
    .setURL(searchURL)
    .setDescription(lines.join("\n"))
    .setColor(+process.env.COLOR_INFO);

  await interaction.deferReply({});
  await interaction.editReply({ embeds: [embed] });
}

async function fetchResults(url) {
  const json = await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok with url: ${url}`);
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error(
        `Failed to load cards from search API with url: ${url}\n${error}`
      );
    });
  return json.data;
}

///////////////////////////////////////////////////////////////////////////////

export default { data, meta, execute };
