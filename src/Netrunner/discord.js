function factionToColor(factionId) {
  let color = process.env.COLOR_ERROR;
  switch(factionId) {
    case "anarch": color = process.env.COLOR_ANARCH; break;
    case "criminal": color = process.env.COLOR_CRIMINAL; break;
    case "shaper": color = process.env.COLOR_SHAPER; break;
    
    case "haas_bioroid": color = process.env.COLOR_HAAS_BIOROID; break;
    case "jinteki": color = process.env.COLOR_JINTEKI; break;
    case "nbn": color = process.env.COLOR_NBN; break;
    case "weyland_consortium": color = process.env.COLOR_WEYLAND_CONSORTIUM; break;
    
    case "neutral_runner": color = process.env.COLOR_NEUTRAL_RUNNER; break;
    case "neutral_corp": color = process.env.COLOR_NEUTRAL_CORP; break;
    
    case "adam": color = process.env.COLOR_ADAM; break;
    case "apex": color = process.env.COLOR_APEX; break;
    case "sunny_lebeau": color = process.env.COLOR_SUNNY_LEBEAU; break;
  }
  return +color;
}

function factionToEmote(factionId) {
  switch(factionId) {
    case "anarch": return "<:s_anarch:960567507528335410>";
    case "criminal": return "<:s_criminal:960567513316462652>";
    case "shaper": return "<:s_shaper:960567518991368192>";
    
    case "haas_bioroid": return "<:s_hb:960567290611515442>";
    case "jinteki": return "<:s_jinteki:960567298228383774>";
    case "nbn": return "<:s_nbn:960567302401720390>";
    case "weyland_consortium": return "<:s_weyland:960567452331290715>";
    
    case "adam": return "<:s_adam:960567530584440883>";
    case "apex": return "<:s_apex:960567542181675008>";
    case "sunny_lebeau": return "<:s_sunny:960567551811792937>";

    case "neutral_runner": return "<:s_nsg:960570296400752660>";
    case "neutral_corp": return "<:s_nsg:960570296400752660>";
    default: return "<:s_nsg:960570296400752660>";
  }
}

function factionToImage(factionId) {
  switch(factionId) {
    case "anarch": return process.env.IMAGE_ANARCH;
    case "criminal": return process.env.IMAGE_;
    case "shaper": return process.env.IMAGE_;
    
    case "haas_bioroid": return process.env.IMAGE_HAAS_BIOROID;
    case "jinteki": return process.env.IMAGE_JINTEKI;
    case "nbn": return process.env.IMAGE_NBN;
    case "weyland_consortium": return process.env.IMAGE_WEYLAND_CONSORTIUM; 
    
    case "adam": return process.env.IMAGE_ADAM;
    case "apex": return process.env.IMAGE_APEX;
    case "sunny_lebeau": return process.env.IMAGE_SUNNY_LEBEAU;

    default: return process.env.IMAGE_NETRUNNER; // Neutral corp/runner
  }
}

function formatText(text) {
  return text
    .replace(/<\/?strong>/g, "**")
    .replace(/<\/?em>/g, "*")
    .replaceAll("[credit]", "<:s_credit:960570295364763719>")
    .replaceAll("[click]", "<:s_click:960568324742344764>")
    .replaceAll("[recurring-credit]", "<:s_recurring_credit:960570296203616396>")
    .replaceAll("[link]", "<:s_link:960570296165888051>")
    .replaceAll("[mu]", "<:s_mu:960570296048447519>")
    .replaceAll("[interrupt]", "<:s_interrupt:960570295830335489>")
    .replaceAll("[subroutine]", "<:s_subroutine:960570296065216582>")
    .replaceAll("[trash]", "<:s_trash_ability:960570296123920495>")
    .replaceAll("[anarch]", factionToEmote("anarch"))
    .replaceAll("[criminal]", factionToEmote("criminal"))
    .replaceAll("[shaper]", factionToEmote("shaper"))
    .replaceAll("[haas-bioroid]", factionToEmote("haas_bioroid"))
    .replaceAll("[jinteki]", factionToEmote("jinteki"))
    .replaceAll("[nbn]", factionToEmote("nbn"))
    .replaceAll("[weyland-consortium]", factionToEmote("weyland_consortium"))
}

module.exports = {
  factionToColor,
  factionToEmote,
  factionToImage,
  formatText
}