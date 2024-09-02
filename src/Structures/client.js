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
import { init as initCommands } from "./commands.js";
import { init as initHandler } from "./handler.js";
import { init as initEvents } from "./events.js";
import { init as initNetrunner } from "./../Netrunner/api.js";
import { init as initONR } from "./../ONR/api.js";

///////////////////////////////////////////////////////////////////////////////

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

client.commands = new Collection();

///////////////////////////////////////////////////////////////////////////////

export async function start(config) {
  client.config = config;

  // Initialise card data so it can be accessed by commands on initialisation
  console.log("initialising nrdb api...");
  await initNetrunner();
  console.log("initialising onr api...");
  await initONR();

  // Initialise bot features
  console.log("loading commands...");
  await initCommands(client);
  console.log("loading handler...");
  await initHandler(client);
  console.log("loading events...");
  await initEvents(client);

  await client.login(process.env.TOKEN);
}
