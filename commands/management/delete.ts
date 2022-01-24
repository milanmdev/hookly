var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a webhook in this server")
    .addStringOption((option) =>
      option
        .setName("mini_id")
        .setDescription("The last 6 digits of the webhook's ID")
        .setRequired(true)
    ),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 5,
    permissions: ["MANAGE_WEBHOOKS"],
    clientPermissions: ["MANAGE_WEBHOOKS"],
  },
  async execute(client, interaction) {
    const mini_id = client.functions.args(interaction, "mini_id");

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

    let confEmbed = new Discord.MessageEmbed()
      .setTitle("<:trash:891562288526549023> Delete Webhook")
      .setDescription(
        `Are you sure you would like to delete the \`${webhook.name}\` (\`${webhook.id}\`) webhook?\n\n**NOTE:** This will expire in 60 seconds.`
      )
      .setColor("ORANGE")
      .setTimestamp();

    let continueButton = new Discord.MessageButton()
      .setLabel("Continue")
      .setCustomId("continueDeleteWebhook")
      .setStyle("SUCCESS");

    let cancelButton = new Discord.MessageButton()
      .setLabel("Cancel")
      .setCustomId("cancelDeleteWebhook")
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
        if (collectedData.customId == "continueDeleteWebhook") {
          let embed = new Discord.MessageEmbed()
            .setTitle("Webhook Deleted")
            .setDescription(
              `Successfully deleted the \`${webhook.name}\` (\`${webhook.id}\`) webhook.`
            )
            .setColor("GREEN")
            .setTimestamp();

          await webhook.delete();

          collectedData.update({
            content: null,
            embeds: [embed],
            components: [],
          });
        } else if (collectedData.customId == "cancelDeleteWebhook") {
          let cancelEmbed = new Discord.MessageEmbed()
            .setTitle("<:trash:891562288526549023> Delete Webhook")
            .setDescription(
              "This command was canceled. To sync commands, To delete the webhook, re-run the `/delete` command."
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
          .setTitle("<:trash:891562288526549023> Delete Webhook")
          .setDescription(
            "This command was canceled due to timeout. To delete the webhook, re-run the `/delete` command."
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
          .setTitle("<:trash:891562288526549023> Delete Webhook")
          .setDescription(
            "An unknown error has occured. To delete the webhook, re-run the `/delete` command."
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
