function rarityToColor(rarity) {
  let color = process.env.COLOR_ERROR;
  switch(rarity) {
    case "Vital": color = process.env.COLOR_ONR_VITAL; break;
    case "Common": color = process.env.COLOR_ONR_COMMON; break;
    case "Uncommon": color = process.env.COLOR_ONR_UNCOMMON; break;
    case "Rare": color = process.env.COLOR_ONR_RARE; break;
  }
  return +color;
}

function formatText(text) {
  return text
    .replace(/<\/?em>/g, "*")
    .replaceAll("[bit]", process.env.EMOJI_ONR_BIT)
    .replaceAll("[ability]", process.env.EMOJI_ONR_ABILITY)
    .replaceAll("[subroutine]", process.env.EMOJI_ONR_SUBROUTINE)
    .replaceAll("[trash]", process.env.EMOJI_ONR_TRASH)
}

module.exports = {
  rarityToColor,
  formatText,
}