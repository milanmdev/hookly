var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get a link to the support server for the Hookly bot"),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 1,
    permissions: [],
    clientPermissions: [],
  },
  async execute(client, interaction) {
    let embed = new Discord.MessageEmbed()
      .setTitle("<:info:783206280638103582> Hookly Support")
      .setDescription(client.config.data.support)
      .setColor("BLURPLE")
      .setTimestamp();

    let supportButton = new Discord.MessageButton()
      .setLabel("Support Server")
      .setURL(client.config.data.support)
      .setStyle("LINK");

    let actionRow = new Discord.MessageActionRow().addComponents([
      supportButton,
    ]);

    interaction.followUp({ embeds: [embed], components: [actionRow] });
  },
};
