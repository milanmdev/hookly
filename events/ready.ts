var fs = require("fs");
var chalk = require("chalk");

module.exports = async (client) => {
  /* Status */
  client.user.setStatus("online");
  client.user.setActivity("/help", {
    type: "WATCHING",
  });

  /* Slash Command Fetcher */
  let fetchCommands = await client?.application.commands.fetch();
  let activeCommands = fetchCommands.map((command) => command.name);

  let commands = [];
  fs.readdirSync("./commands/").forEach(async (dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/${dir}`)
      .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const command = require(`../commands/${dir}/${file}`);
      commands.push(command.data);
    }

    for (const command of commands) {
      if (!activeCommands.includes(command.name)) {
        await client.application.commands.create(command.toJSON());
      }
    }
  });
};
