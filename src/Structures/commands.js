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

import BanlistView from "./../Commands/Netrunner/banlistView.js";
import CycleView from "./../Commands/Netrunner/cycleView.js";
import FormatView from "./../Commands/Netrunner/formatView.js";
import SetView from "./../Commands/Netrunner/setView.js";
import Search from "../Commands/Netrunner/search.js";
import Random from "../Commands/Netrunner/random.js";

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

    BanlistView,
    CycleView,
    FormatView,
    SetView,
    Search,
    Random,

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
