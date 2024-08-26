const { REST, Routes } = require("discord.js");

module.exports = {
  async execute(client) {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    const commandArray = new Array();
    const commands = client.commands;

    commands.forEach((cmd) => {
      commandArray.push(cmd.data);
    });

    await rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID), {
      body: commandArray,
    });
  },
};