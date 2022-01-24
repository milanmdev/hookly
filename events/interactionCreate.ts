var Statcord = require("statcord.js");
var Discord = require("discord.js");

var cooldowns = new Discord.Collection();

module.exports = async (client, interaction) => {
  try {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild()) return;

    var command = client.commands.get(interaction.commandName);
    if (!command) return;

    /* Variables */
    var skipStatcordLog = false;

    /* Sequence Checks */
    if (command.extraData.ownerOnly == true) {
      let application = await client.application.fetch();

      skipStatcordLog = true;
      if (interaction.user.id !== application?.owner.id)
        return interaction.followUp({
          ephemeral: true,
          embeds: [
            client.functions.error(
              "You don't have the correct permissions to run this command."
            ),
          ],
        });
    }

    try {
      let userPermissions = client.functions.parsePermissions(
        interaction,
        "user",
        command.extraData.permissions
      );
      if (!userPermissions.hasPermissions) {
        return interaction.followUp({
          embeds: [
            client.functions.permissions("user", userPermissions.string),
          ],
          ephemeral: true,
        });
      }
    } finally {
      let clientPermissions = client.functions.parsePermissions(
        interaction,
        "client",
        command.extraData.clientPermissions
      );
      if (!clientPermissions.hasPermissions) {
        return interaction.followUp({
          embeds: [
            client.functions.permissions("client", clientPermissions.string),
          ],
          ephemeral: true,
        });
      }
    }

    /* Defer Command */
    await interaction.deferReply({
      ephemeral: command.extraData.ephemeral ? true : false,
    });

    /* Cooldown */
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = (command.extraData.cooldown || 1) * 1000;
    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.followUp({
          ephemeral: true,
          embeds: [
            client.functions.error(
              `Please wait \`${timeLeft.toFixed(
                1
              )}\` more second(s) before running the \`${
                command.data.name
              }\` command.`
            ),
          ],
        });
      }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    /* Execute Command */
    await command.execute(client, interaction).then(async () => {
      if (!skipStatcordLog == true) {
        await Statcord.ShardingClient.postCommand(
          interaction.commandName,
          interaction.user.id,
          client
        );
      }
    });
  } catch (e) {
    console.error(e);
    try {
      if (interaction.deferred)
        return interaction.followUp({
          embeds: [client.functions.error(e)],
        });
      else
        return interaction.reply({
          embeds: [client.functions.error(e)],
        });
    } catch (e) {
      return;
    }
  }
};
