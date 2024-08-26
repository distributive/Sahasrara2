const { EmbedBuilder } = require("discord.js");
const api = require("./api.js");
const discord = require("./discord.js");

///////////////////////////////////////////////////////////////////////////////
// PUBLIC

function createCardEmbed(card) {
  return new EmbedBuilder()
    .setColor(discord.rarityToColor(card.rarity))
    .setTitle(card.title)
    .setDescription(cardToEmbedBody(card))
    .setThumbnail(api.getCardImage(card))
    .setFooter({ text: cardToFooter(card) });
}

function createCardImageEmbed(card) {
  return new EmbedBuilder()
    .setColor(discord.rarityToColor(card.rarity))
    .setTitle(card.title)
    .setImage(api.getCardImage(card));
}

function createCardFlavourEmbed(card) {
  let flavourText = card.flavor ? card.flavor : "`Card has no flavour text.`"
  return new EmbedBuilder()
    .setColor(discord.rarityToColor(card.rarity))
    .setTitle(card.title)
    .setDescription(flavourText)
    .setThumbnail(api.getCardImage(card))
}

///////////////////////////////////////////////////////////////////////////////
// PRIVATE

function cardToEmbedBody(card) {
  let type = card.type;
  if (card.subtypes) {
    type += `: ${card.subtypes}`;
  }

  let stats = "";
  if (card.cost != null) {
    stats += " • ";
    stats += (card.side_code != "corp" || card.card_type_id	== "operation") ? "Cost: " : "Rez: ";
    stats += card.cost;
  }
  if (card.strength != null) {
    stats += ` • Strength: ${card.strength}`;
  }
  if (card.trash_cost != null) {
    stats += ` • Trash: ${card.cost}`;
  }
  if (card.type_code == "agenda") {
    stats += ` • (${card.advancement_requirement}/${card.agenda_points})`;
  }
  if (card.memory_cost != null) {
    stats += ` • MU: ${card.memory_cost}`;
  }

  let header = `**${type}${stats}**`
  let body = discord.formatText(card.text);

  return header + "\n" + body;
}

function cardToFooter(card) {
  return `${card.set} • ${card.rarity}`;
}

///////////////////////////////////////////////////////////////////////////////

module.exports = {
  createCardEmbed,
  createCardImageEmbed,
  createCardFlavourEmbed,
}