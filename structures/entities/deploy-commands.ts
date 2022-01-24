var fs = require("fs");
var { REST } = require("@discordjs/rest");
var { Routes } = require("discord-api-types/v9");

module.exports = async (client) => {
  const commands = [];
  fs.readdirSync("./commands/").forEach((dir) => {
    const commandFiles = fs
      .readdirSync(`./commands/${dir}`)
      .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const command = require(`./../../commands/${dir}/${file}`);
      commands.push(command.data.toJSON());
    }
  });

  const rest = new REST({ version: "9" }).setToken(client.token);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    return {
      message: "Successfully registered application commands.",
      code: "OK",
    };
  } catch (error) {
    return { message: error, code: "ERROR" };
  }
};
