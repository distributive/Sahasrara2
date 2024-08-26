const { EmbedBuilder } = require("discord.js");
const api = require("./api.js");
const discord = require("./discord.js");

function createPrintingEmbed(printing) {
  return new EmbedBuilder()
    .setColor(discord.factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setDescription(printingToEmbedBody(printing))
    .setThumbnail(printing.attributes.images.nrdb_classic.medium)
    .setFooter({ text: printingToFooter(printing), iconURL: discord.factionToImage(printing.attributes.faction_id) });
}

function createPrintingImageEmbed(printing) {
  return new EmbedBuilder()
    .setColor(discord.factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}en/card/${printing.id}`)
    .setImage(printing.attributes.images.nrdb_classic.large);
}

function createPrintingFlavourEmbed(printing) {
  let flavourText = printing.attributes.flavor ? printing.attributes.flavor : "`Card has no flavour text.`"
  return new EmbedBuilder()
    .setColor(discord.factionToColor(printing.attributes.faction_id))
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}card/${printing.id}`)
    .setDescription(flavourText)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium)
}

function createPrintingBanlistEmbed(printing) {
  return {}; // TODO
}

function createPrintingIndexOutOfBoundsEmbed(card, printing) {
  const length = card.attributes.printing_ids.length;
  const error = `\`Index out of bounds! ${card.attributes.title} has ${length} printing${length != 1 ? "s" : ""}.\``; // TODO: add error module
  return new EmbedBuilder()
    .setColor(0xff0000) // TODO: add color module
    .setTitle(printingToTitle(printing))
    .setURL(`${process.env.NRDB_URL}card/${printing.id}`)
    .setDescription(error)
    .setThumbnail(printing.attributes.images.nrdb_classic.medium)
}

function createDeprecationEmbed() {
  const message = "I now use slash commands! To see the new help menu, try `/help`!";
  return new EmbedBuilder()
    .setColor(discord.factionToColor(+process.env.COLOR_ERROR))
    .setTitle("$ commands deprecated!")
    .setDescription(message)
}

// PRIVATE //

function printingToTitle(printing) {
  return (printing.attributes.is_unique ? "♦ " : "") + printing.attributes.title;
}

function printingToEmbedBody(printing) {
  let type = api.getCardType(printing.attributes.card_type_id).attributes.name;
  if (printing.attributes.display_subtypes) {
    type += `: ${printing.attributes.display_subtypes}`;
  }

  let stats = "";
  if (printing.attributes.cost != null) {
    stats += " • ";
    stats += (printing.attributes.side_id != "corp" || printing.attributes.card_type_id	== "operation") ? "Cost: " : "Rez: ";
    stats += printing.attributes.cost;
  }
  if (printing.attributes.strength != null) {
    stats += ` • Strength: ${printing.attributes.strength}`;
  }
  if (printing.attributes.trash_cost != null) {
    stats += ` • Trash: ${printing.attributes.cost}`;
  }
  if (printing.attributes.card_type_id == "agenda") {
    stats += ` • (${printing.attributes.advancement_requirement}/${printing.attributes.agenda_points})`;
  }
  if (printing.attributes.card_type_id == "corp_identity" || printing.attributes.card_type_id == "runner_identity") {
    stats += ` • (${printing.attributes.minimum_deck_size}/${printing.attributes.influence_limit})`;
  }
  if (printing.attributes.base_link != null) {
    stats += ` • Link: ${printing.attributes.base_link}`;
  }
  if (printing.attributes.memory_cost != null) {
    stats += ` • MU: ${printing.attributes.memory_cost}`;
  }

  let influence = ""
  if (printing.attributes.influence_cost) {
     influence = ` • Influence: ${"●".repeat(printing.attributes.influence_cost)}`;
  } else if (printing.attributes.influence_cost == 0) {
     influence = ` • Influence: –`;
  }

  let header = `**${type}${stats}${influence}**`
  let body = discord.formatText(printing.attributes.text);

  return header + "\n" + body;
}

function printingToFooter(printing) {
  return `${api.getFaction(printing.attributes.faction_id).attributes.name} • ${printing.attributes.card_cycle_name} • ${printing.attributes.card_set_name} #${printing.attributes.position}`;
}

module.exports = {
  createPrintingEmbed,
  createPrintingImageEmbed,
  createPrintingFlavourEmbed,
  createPrintingBanlistEmbed,
  createPrintingIndexOutOfBoundsEmbed,
  
  createDeprecationEmbed,
}