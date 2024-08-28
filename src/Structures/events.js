/**
 * The events module. This loads all the event handlers at startup.
 *
 * @file   This files defines the events module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { readdirSync } from "node:fs";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const PATH = process.cwd() + "/src/Events";
  const events = readdirSync(PATH);
  for (let event of events) {
    event = event.split(".")[0];
    client.on(event, async (...args) => {
      await require(`${PATH}/${event}.js`).execute(...args);
    });
  }
}
