/**
 * The command module. This loads all the commands at startup.
 *
 * @file   This files defines the commands module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { readdirSync } from "node:fs";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const commands = client.commands;
  const PATH = process.cwd() + "/src/Commands";

  const folders = readdirSync(PATH);
  for (let dir of folders) {
    const folder = readdirSync(`${PATH}/${dir}`);

    for (let file of folder) {
      const cmd = await require(`${PATH}/${dir}/${file}`);
      commands.set(cmd.data.name, cmd);
    }
  }
}
