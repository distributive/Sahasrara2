/**
 * The command module. This loads all the commands at startup.
 *
 * @file   This files defines the commands module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import Help from "./../Commands/help.js";
import Mark from "./../Commands/mark.js";
import Side from "./../Commands/side.js";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const commands = client.commands;
  commands.set(Help.data.name, Help);
  commands.set(Mark.data.name, Mark);
  commands.set(Side.data.name, Side);
}
