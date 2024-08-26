const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    activities: [{ name: "Now with slash commands!", type: ActivityType.Custom }],
    status: "online",
  },
});

client.commands = new Collection();

module.exports.start = async (config) => {
  client.config = config;

  console.log("loading commands...");
  await require("./commands.js").execute(client);
  console.log("loading handler...");
  await require("./handler.js").execute(client);
  console.log("loading events...");
  await require("./events.js").execute(client);

  console.log("initialising nrdb api...");
  await require("./../Netrunner/api.js").init();
  console.log("initialising onr api...");
  await require("./../ONR/api.js").init();

  await client.login(process.env.TOKEN);
};