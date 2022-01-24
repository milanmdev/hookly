var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sync-commands")
    .setDescription("[Owner Only] Sync all slash commands with Discord"),
  extraData: {
    ownerOnly: true,
    ephemeral: false,
    cooldown: 1,
    permissions: [],
    clientPermissions: [],
  },
  execute: async (client, interaction) => {
    let confEmbed = new Discord.MessageEmbed()
      .setTitle("<:download:888942330495791215> Sync Commands")
      .setDescription(
        "Are you sure you would like to sync all commands?\n\n**NOTE:** This will cause all commands to go down for a short amount of time."
      )
      .setColor("ORANGE")
      .setTimestamp();

    let continueButton = new Discord.MessageButton()
      .setLabel("Continue")
      .setCustomId("continueSyncCommands")
      .setStyle("SUCCESS");

    let cancelButton = new Discord.MessageButton()
      .setLabel("Cancel")
      .setCustomId("cancelSyncCommands")
      .setStyle("DANGER");

    let actionRow = new Discord.MessageActionRow().addComponents([
      continueButton,
      cancelButton,
    ]);

    await interaction.followUp({
      embeds: [confEmbed],
      components: [actionRow],
    });
    var reply = await interaction.fetchReply();

    var collector = interaction.channel.createMessageComponentCollector({
      componentType: "BUTTON",
      time: 60000,
      max: 1,
      filter: (component) =>
        component.user.id == interaction.user.id &&
        component.message.id == reply.id,
    });

    collector.on("end", async (collected, reason) => {
      let collectedData = collected.find(
        (application) => application.user.id == interaction.user.id
      );
      if (reason == "limit") {
        if (collectedData.customId == "continueSyncCommands") {
          let embed = new Discord.MessageEmbed()
            .setTitle("Synced Commands")
            .setDescription("All commands have been synced with Discord")
            .setColor("GREEN")
            .setTimestamp();

          collectedData.update({
            content: "<a:loading:784127487118016573> Syncing commands...",
            embeds: [],
            components: [],
          });
          await client.deployCommands(client).then((deploy) => {
            setTimeout(() => {
              if (deploy.code == "OK")
                return interaction.editReply({
                  content: null,
                  embeds: [embed],
                  components: [],
                });
              if (deploy.code == "ERROR")
                return interaction.editReply({
                  content: null,
                  embeds: [client.functions.error(deploy.message)],
                  components: [],
                });
            }, 5000);
          });
        } else if (collectedData.customId == "cancelSyncCommands") {
          let cancelEmbed = new Discord.MessageEmbed()
            .setTitle("<:download:888942330495791215> Sync Commands")
            .setDescription(
              "This command was canceled. To sync commands, re-run the `/sync-commands` command."
            )
            .setColor("RED")
            .setTimestamp();

          collectedData.update({
            content: null,
            embeds: [cancelEmbed],
            components: [],
          });
        }
      } else if (reason == "time") {
        let timeoutEmbed = new Discord.MessageEmbed()
          .setTitle("<:download:888942330495791215> Sync Commands")
          .setDescription(
            "This command was canceled due to timeout. To sync commands, re-run the `/sync-commands` command."
          )
          .setColor("RED")
          .setTimestamp();

        interaction.editReply({
          content: null,
          embeds: [timeoutEmbed],
          components: [],
        });
      } else {
        let errorEmbed = new Discord.MessageEmbed()
          .setTitle("<:download:888942330495791215> Sync Commands")
          .setDescription(
            "An unknown error has occured. To sync commands, re-run the `/sync-commands` command."
          )
          .setColor("RED")
          .setTimestamp();

        interaction.editReply({
          content: null,
          embeds: [errorEmbed],
          components: [],
        });
      }
    });
  },
};
