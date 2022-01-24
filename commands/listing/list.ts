var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");
var pagination = require("@milanmdev/discordjs-button-pagination");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List all webhooks for this server"),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 3,
    permissions: ["MANAGE_WEBHOOKS"],
    clientPermissions: ["MANAGE_WEBHOOKS"],
  },
  async execute(client, interaction) {
    let webhooks = await interaction.guild.fetchWebhooks();
    if (!webhooks)
      return interaction.followUp({
        embeds: [
          client.functions.error(
            "There was an error fetching the webhooks for this server."
          ),
        ],
      });
    if (!webhooks.size)
      return interaction.followUp({
        embeds: [
          client.functions.error("There are no webhooks in this server."),
        ],
      });

    let webhooksFinal = webhooks.map((webhook) => {
      return {
        name: webhook.name,
        id: webhook.id,
        avatar: webhook.avatar
          ? `https://cdn.discordapp.com/avatars/${webhook.id}/${webhook.avatar}.webp`
          : `https://cdn.discordapp.com/embed/avatars/0.png`,
        meta: {
          channelFollow:
            webhook.type == "Channel Follower"
              ? {
                  channel: {
                    name: webhook.sourceChannel.name,
                    id: webhook.sourceChannel.id,
                  },
                  guild: {
                    name: webhook.sourceGuild.name,
                    id: webhook.sourceGuild.id,
                    icon: webhook.sourceGuild.icon
                      ? `https://cdn.discordapp.com/icons/${webhook.sourceGuild.id}/${webhook.sourceGuild.icon}.webp`
                      : null,
                  },
                }
              : null,
          channel: webhook.channelId,
        },
      };
    });

    let embeds = [];
    webhooksFinal.forEach((webhook) => {
      let webhookEmbed = new Discord.MessageEmbed()
        .setTitle(`${webhook.name} - \`${webhook.id}\``)
        .addField(
          "Mini ID",
          `\`${webhook.id.substr(webhook.id.length - 6)}\``,
          true
        )
        .addField("Channel", `<#${webhook.meta.channel}>`, true)
        .setThumbnail(webhook.avatar)
        .setColor("BLURPLE");

      if (webhook.meta.channelFollow) {
        webhookEmbed.addField(
          "Channel Following",
          `\`${webhook.meta.channelFollow.channel.name}\` (\`${webhook.meta.channelFollow.channel.id}\`) in \`${webhook.meta.channelFollow.guild.name}\` (\`${webhook.meta.channelFollow.guild.id}\`)`
        );
      }

      embeds.push(webhookEmbed);
    });

    const previousButton = new Discord.MessageButton()
      .setCustomId("previousbtn")
      .setLabel("Previous")
      .setStyle("DANGER");
    const nextButton = new Discord.MessageButton()
      .setCustomId("nextbtn")
      .setLabel("Next")
      .setStyle("SUCCESS");

    pagination(interaction, embeds, [previousButton, nextButton]);
  },
};
