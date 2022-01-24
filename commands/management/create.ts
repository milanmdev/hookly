var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");
var { ChannelType } = require("discord-api-types/v9");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a webhook in this server")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name for the webhook")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to create the webhook in")
        .addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews])
        .setRequired(false)
    ),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 5,
    permissions: ["MANAGE_WEBHOOKS"],
    clientPermissions: ["MANAGE_WEBHOOKS"],
  },
  async execute(client, interaction) {
    const name = client.functions.args(interaction, "name");
    const channel = client.functions.args(interaction, "channel") || {
      channel: interaction.channel,
    };

    const validTypes = this.data.options.find(
      (i) => i.name === "channel"
    ).channel_types;
    const validChannel = client.functions.validChannel(
      channel.channel,
      validTypes
    );
    if (!validChannel)
      return interaction.followUp({
        embeds: [
          client.functions.error(interaction, "Invalid channel type provided."),
        ],
      });

    await channel.channel
      .createWebhook(name.value)
      .then((webhook) => {
        const embed = new Discord.MessageEmbed()
          .setTitle("Webhook Created")
          .setDescription(
            `Successfully created the webhook \`${webhook.name}\` (\`${webhook.id}\`) in the channel \`${channel.channel.name}\` (\`${channel.channel.id}\`).`
          )
          .setColor("GREEN")
          .setTimestamp();

        interaction.followUp({
          embeds: [embed],
        });
      })
      .catch((e) => {
        return interaction.followUp({
          embeds: [
            client.functions.error(
              `An error has occured while creating the webhook: ${e}`
            ),
          ],
        });
      });
  },
};
