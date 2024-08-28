/**
 * The handler module. This registers all application commands with the Discord API at startup.
 *
 * @file   This files defines the handler module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import { REST, Routes } from "discord.js";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  const commandArray = new Array();
  const commands = client.commands;

  commands.forEach((cmd) => {
    commandArray.push(cmd.data);
  });

  await rest.put(
    Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
    {
      body: commandArray,
    }
  );
}
