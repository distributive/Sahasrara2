const api = require("./../Netrunner/api.js");
const embed = require("./../Netrunner/embed.js");
const onrApi = require("./../ONR/api.js");
const onrEmbed = require("./../ONR/embed.js");

module.exports = {
  async execute(message) {
    const { author, content } = message;

    // Ignore bot/empty messages
    if (author.bot || !content) { return; }

    if (content.toLowerCase().substring(0,5) == "$help") {
      sendDeprecationWarning(message);
    } else {
      parseInlineCommands(message);
    }
  },
};

///////////////////////////////////////////////////////////////////////////////

async function parseInlineCommands(message) {
  const { client, content } = message;

  const filteredContent = content.replace(/(?<!\\)```[\s\S]*?```/g, ""); // Ignore code blocks
  const regex = /\[\[.*?\]\]|\{\{.*?\}\}|<<.*?>>|\(\(.*?\)\)|\[\|.*?\|\]|\{\|.*?\|\}|<\|.*?\|>/g; // Find inline commands
  const matches = filteredContent.match(regex);
  if (!matches) { return; }
  
  const channel = client.channels.cache.get(message.channelId);
  for (const match of matches) {
    const rawInput = match.substring(2, match.length - 2).trim();
    if (!rawInput) {
      return;
    }

    if (match[1] != "|") {
      await parseNetrunnerCard(match, rawInput, channel);
    } else {
      parseOnrCard(match, rawInput, channel);
    }
  }
}

async function parseNetrunnerCard(match, rawInput, channel) {
  // Separate command data
  const inputs = rawInput.split("|");
  let query, index;
  if (inputs.length > 1) {
    query = inputs.slice(0,-1).join("|");
    index = +inputs[inputs.length - 1];
  } else {
    query = rawInput;
    index = -1;
  }

  // If index is not a number, default to -1 (TODO: allow set/cycle names as indices)
  if (isNaN(index)) {
    index = -1;
  }

  const card = await api.getClosestCard(query);
  if (index < 0) {
    index += card.attributes.printing_ids.length;
  }
  index = card.attributes.printing_ids.length - index - 1;

  // Check index is valid
  if (index < 0 || index >= card.attributes.printing_ids.length) {
    const printing = await api.fetchPrinting(card.attributes.latest_printing_id);
    const errorEmbed = embed.createPrintingIndexOutOfBoundsEmbed(card, printing);
    channel.send({ embeds: [errorEmbed] });
    return;
  }

  // Get the indexed printing
  const printing = await api.fetchPrinting(card.attributes.printing_ids[index]);
  
  // Create and send embed
  const outEmbed = match[0] == "[" ? embed.createPrintingEmbed(printing)
                 : match[0] == "{" ? embed.createPrintingImageEmbed(printing)
                 : match[0] == "<" ? embed.createPrintingFlavourEmbed(printing)
                 :                   embed.createPrintingBanlistEmbed(printing)
  channel.send({ embeds: [outEmbed] });
}

function parseOnrCard(match, rawInput, channel) {
  const card = onrApi.getClosestCard(rawInput);
  const outEmbed = match[0] == "[" ? onrEmbed.createCardEmbed(card)
                 : match[0] == "{" ? onrEmbed.createCardImageEmbed(card)
                 :                   onrEmbed.createCardFlavourEmbed(card)
  channel.send({ embeds: [outEmbed] });
}

///////////////////////////////////////////////////////////////////////////////

function sendDeprecationWarning(message) {
  const channel = message.client.channels.cache.get(message.channelId);
  const outEmbed = embed.createDeprecationEmbed();
  channel.send({ embeds: [outEmbed] });
}