/**
 * The primary module for the bot. This should handle startup.
 *
 * @file   This files defines the top level module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    activities: [
      { name: "Now with slash commands!", type: ActivityType.Custom },
    ],
    status: "online",
  },
});

///////////////////////////////////////////////////////////////////////////////

client.commands = new Collection(); // Persistent collection of bot commands

///////////////////////////////////////////////////////////////////////////////

export async function start(config) {
  client.config = config;

  console.log("loading commands...");
  await require("./commands.js").init(client);
  console.log("loading handler...");
  await require("./handler.js").init(client);
  console.log("loading events...");
  await require("./events.js").init(client);

  console.log("initialising nrdb api...");
  await require("./../Netrunner/api.js").default.init();
  console.log("initialising onr api...");
  await require("./../ONR/api.js").default.init();

  await client.login(process.env.TOKEN);
}
