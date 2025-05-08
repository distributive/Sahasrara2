/**
 * A command for selecting random Netrunner cards.
 *
 * @file   This files defines the random command module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fetchPrinting, fetchRandomCard } from "../../Netrunner/api.js";
import { createPrintingEmbed } from "../../Netrunner/embed.js";
import { randomElement } from "../../Utility/random.js";

///////////////////////////////////////////////////////////////////////////////

const data = new SlashCommandBuilder()
  .setName("random")
  .setDescription("select a random Netrunner cards")
  .addStringOption((option) =>
    option.setName("search_query").setDescription("the search query")
  );

const meta = {};

async function execute(interaction, client) {
  const query = interaction.options.getString("search_query");

  if (!query) {
    const card = await fetchRandomCard();
    const printing = await fetchPrinting(card.attributes.latest_printing_id);
    const embed = createPrintingEmbed(printing);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  const queryURI = encodeURIComponent(query);
  const results = await fetchResults(
    `${process.env.SEARCH_URL}simple_api/?search=${queryURI}`
  );

  if (!results.length) {
    const embed = new EmbedBuilder()
      .setTitle(":wastebasket: No results found!")
      .setDescription(
        `Query: \`${query}\`\nYou can check the [syntax guide](${process.env.SEARCH_URL}syntax) for potential errors.`
      )
      .setColor(+process.env.COLOR_ERROR);
    await interaction.reply({ embeds: [embed] });
  } else {
    const printingId = randomElement(results);
    const printing = await fetchPrinting(printingId);
    const embed = createPrintingEmbed(printing);
    await interaction.reply({ embeds: [embed] });
  }
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
