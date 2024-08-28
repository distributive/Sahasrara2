/**
 * The events module. This loads all the event handlers at startup.
 *
 * @file   This files defines the events module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import interactionCreate from "./../Events/interactionCreate.js";
import messageCreate from "./../Events/messageCreate.js";
import ready from "./../Events/ready.js";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  client.on("interactionCreate", async (...args) => {
    interactionCreate(...args);
  });
  client.on("messageCreate", async (...args) => {
    messageCreate(...args);
  });
  client.on("ready", async (...args) => {
    ready(...args);
  });
}
