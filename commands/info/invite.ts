var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite link for the Hookly bot"),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 1,
    permissions: [],
    clientPermissions: [],
  },
  async execute(client, interaction) {
    let embed = new Discord.MessageEmbed()
      .setTitle("<:info:783206280638103582> Invite Hookly")
      .setDescription(client.config.data.invite)
      .setColor("BLURPLE")
      .setTimestamp();

    let inviteButton = new Discord.MessageButton()
      .setLabel("Invite")
      .setURL(client.config.data.invite)
      .setStyle("LINK");

    let actionRow = new Discord.MessageActionRow().addComponents([
      inviteButton,
    ]);

    interaction.followUp({ embeds: [embed], components: [actionRow] });
  },
};
