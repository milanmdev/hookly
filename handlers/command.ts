var fs = require("fs");

module.exports = (client) => {
  fs.readdirSync("./commands/").forEach((dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/${dir}`)
      .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const command = require(`../commands/${dir}/${file}`);
      command.category = dir;

      client.commands.set(command.data.name, command);
    }
  });
};
