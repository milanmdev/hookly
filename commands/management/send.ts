var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");
var { ChannelType } = require("discord-api-types/v9");
var colors = require("../../types/colors.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send a message to a webhook specified")
    .addStringOption((option) =>
      option
        .setName("mini_id")
        .setDescription("The last 6 digits of the webhook's ID")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("The message content displayed above the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The footer for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("The author for the embed")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The color for the embed")
        .addChoices(colors.map((color) => [color, color]))
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("timestamp")
        .setDescription("Whether or not the current timestamp is displayed")
        .setRequired(false)
    ),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 3,
    permissions: ["MANAGE_WEBHOOKS"],
    clientPermissions: ["MANAGE_WEBHOOKS"],
  },
  async execute(client, interaction) {
    const mini_id = client.functions.args(interaction, "mini_id");
    /* Embed Details */
    const content = client.functions.args(interaction, "content") || {
      value: null,
    };
    const title = client.functions.args(interaction, "title") || {
      value: null,
    };
    const description = client.functions.args(interaction, "description") || {
      value: null,
    };
    const footer = client.functions.args(interaction, "footer") || {
      value: null,
    };
    const author = client.functions.args(interaction, "author") || {
      value: null,
    };
    const color = client.functions.args(interaction, "color") || {
      value: null,
    };
    const timestamp = client.functions.args(interaction, "timestamp") || {
      value: false,
    };

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

    let webhook = webhooks.find(
      (w) => w.id.substr(w.id.length - 6) == mini_id.value
    );
    if (!webhook)
      return interaction.followUp({
        embeds: [
          client.functions.error(
            `A webhook with a mini ID value of \`${mini_id.value}\` could not be found.`
          ),
        ],
      });

    /*if (
      !(
        (color.value || timestamp.value) &&
        (description.value || title.value || footer.value || author.value)
      )
    )
      return interaction.followUp({
        embeds: [
          client.functions.error(
            "You must provide a description, title, footer, and/or author when specifying a color and/or timestamp."
          ),
        ],
      });*/ // TODO: Fix this

    if (
      description.value ||
      title.value ||
      author.value ||
      footer.value ||
      color.value ||
      timestamp.value
    ) {
      var embedBuilder = new Discord.MessageEmbed();
      if (description.value) embedBuilder.setDescription(description.value);
      if (title.value) embedBuilder.setTitle(title.value);
      if (footer.value) embedBuilder.setFooter({ text: footer.value });
      if (author.value) embedBuilder.setAuthor({ name: author.value });
      if (color.value) embedBuilder.setColor(color.value);
      if (timestamp.value) embedBuilder.setTimestamp();
    }

    await webhook
      .send({
        content: content.value,
        embeds: embedBuilder ? [embedBuilder] : null,
      })
      .then(() => {
        let embed = new Discord.MessageEmbed()
          .setTitle("Message Sent")
          .setDescription(
            `Successfully sent the message to the \`${webhook.name}\` (\`${webhook.id}\`) webhook.`
          )
          .setColor("GREEN")
          .setTimestamp();

        interaction.followUp({
          embeds: [embed],
        });
      })
      .catch((e) => {
        interaction.followUp({
          embeds: [
            client.functions.error(
              `An error has occured while sending a message: \`\`\`${e}\`\`\``
            ),
          ],
        });
      });
  },
};
