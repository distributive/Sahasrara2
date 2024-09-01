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

import AliasAdd from "./../Commands/Superuser/aliasAdd.js";
import AliasRemove from "./../Commands/Superuser/aliasRemove.js";
import AliasView from "../Commands/Superuser/aliasView.js";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const commands = client.commands;
  commands.set(Help.data.name, Help);
  commands.set(Mark.data.name, Mark);
  commands.set(Side.data.name, Side);

  commands.set(AliasAdd.data.name, AliasAdd);
  commands.set(AliasRemove.data.name, AliasRemove);
  commands.set(AliasView.data.name, AliasView);
}
