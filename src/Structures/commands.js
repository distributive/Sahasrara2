/**
 * The command module. This loads all the commands at startup.
 *
 * @file   This files defines the commands module for the bot.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import Help from "./../Commands/help.js";
import BasicActions from "./../Commands/basicActions.js";
import Mark from "./../Commands/mark.js";
import Side from "./../Commands/side.js";

import Scoop from "./../Commands/scoop.js";
import Accept from "./../Commands/accept.js";
import Reject from "./../Commands/reject.js";

import AliasAdd from "./../Commands/Superuser/aliasAdd.js";
import AliasRemove from "./../Commands/Superuser/aliasRemove.js";
import AliasView from "../Commands/Superuser/aliasView.js";
import WhitelistAddServer from "../Commands/Superuser/whitelistServerAdd.js";
import WhitelistRemoveServer from "../Commands/Superuser/whitelistServerRemove.js";
import WhitelistViewServers from "../Commands/Superuser/whitelistServerView.js";

///////////////////////////////////////////////////////////////////////////////

export async function init(client) {
  const commands = [
    Help,
    BasicActions,
    Mark,
    Side,

    Scoop,
    Accept,
    Reject,

    AliasAdd,
    AliasRemove,
    AliasView,
    WhitelistAddServer,
    WhitelistRemoveServer,
    WhitelistViewServers,
  ];

  commands.forEach((command) => {
    client.commands.set(command.data.name, command);
  });
}
