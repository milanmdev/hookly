var Discord = require("discord.js");
var { SlashCommandBuilder } = require("@discordjs/builders");
var fs = require("fs");

var categoriesList = fs.readdirSync("./commands");
categoriesList = remove_by_value(categoriesList, "developer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu for the bot")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to get help for")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("A category to find commands for")
        .addChoices(
          categoriesList.map((i) => {
            return [i, i];
          })
        )
        .setRequired(false)
    ),
  extraData: {
    ownerOnly: false,
    ephemeral: false,
    cooldown: 1,
    permissions: [],
    clientPermissions: [],
  },
  async execute(client, interaction) {
    var commandFetch = client.functions.args(interaction, "command");
    var categoryFetch = client.functions.args(interaction, "category");

    if (!commandFetch && !categoryFetch) {
      let categoriesEmbed = new Discord.MessageEmbed()
        .setTitle("Hookly Help")
        .setDescription(
          "Use `/support` to get an invite for the Hookly support server."
        )
        .addFields(
          {
            name: ":tools: Utilities",
            value: `\`/help category:utilities\``,
            inline: true,
          },
          {
            name: "<:info:783206280638103582> Info",
            value: `\`/help category:info\``,
            inline: true,
          }
        )
        .setColor("BLURPLE")
        .setTimestamp();

      let supportLink = new Discord.MessageButton()
        .setLabel("Support Server")
        .setURL(client.config.data.support)
        .setStyle("LINK");

      let actionRow = new Discord.MessageActionRow().addComponents([
        supportLink,
      ]);
      await interaction.followUp({
        embeds: [categoriesEmbed],
        components: [actionRow],
      });
    }
    if (categoryFetch && commandFetch) {
      return interaction.followUp({
        embeds: [
          client.functions.error(
            "Please specify a command or a category.\n\nYou can not specify both."
          ),
        ],
      });
    }
    if (categoryFetch && categoryFetch.value) {
      let category = categoryFetch.value.toLowerCase();
      await interaction.followUp(categoryHelp(category));
    }

    if (commandFetch && commandFetch.value) {
      let command = client.commands.get(commandFetch.value);

      if (!command || !command.data)
        return interaction.followUp({
          embeds: [
            client.functions.error(
              'Please provide a valid command (without the "/")'
            ),
          ],
        });

      let embed = new Discord.MessageEmbed()
        .setAuthor({
          name: `${
            command.data.name[0].toUpperCase() +
            command.data.name.slice(1).toLowerCase()
          } Command Help`,
        })
        .setDescription(
          "Use `/support` to get an invite for our support server."
        )
        .addField(
          "<:command:796772312480743424> **Name:**",
          `${command.data.name}`
        )
        .addField(
          "<:folder_plus:846227198221484062> **Category:**",
          `${command.category}`
        )
        .addField(
          "<:role:846230701702381589> **Permissions Required:**",
          `${
            command.extraData.ownerOnly
              ? `Dev Only -- **Useable:** ${
                  (await client.functions.isOwner(client, interaction.user))
                    ? "<:greencheck:765216339623149609>"
                    : "<:redcross:765216959826100244>"
                }`
              : (client.functions.parsePermissions(
                  interaction,
                  "user",
                  command.extraData.permissions
                ).string || "No Permissions Required") +
                ` -- **Useable:** ${
                  client.functions.parsePermissions(
                    interaction,
                    "user",
                    command.extraData.permissions
                  ).hasPermissions
                    ? "<:greencheck:765216339623149609>"
                    : "<:redcross:765216959826100244>"
                }`
          }`
        )
        .addField(
          "<:stopwatch:846225871105949726> **Cooldown:**",
          `${command.extraData.cooldown || 1}s`
        )
        .addField(
          "<:threadSmall:890729395399065612> **Description:**",
          `\`\`\`${command.data.description}\`\`\``
        )
        .setColor("BLURPLE")
        .setTimestamp();

      interaction.followUp({ embeds: [embed] });
    }

    function categoryHelp(categoryFetch) {
      let category = categoryFetch.toLowerCase();
      let validCategory = client.categories.find((i) => i == category);
      if (!validCategory)
        return {
          embeds: [client.functions.error("Please specify a valid category.")],
        };

      let commands = client.commands
        .filter(function (data) {
          if (data.category !== category) {
            return false;
          }
          return true;
        })
        .map((d) => {
          return d;
        });
      let commandsList = commands.map((command) => {
        return `${command.data.name} | ${command.data.description}`;
      });

      let commandsEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: `${
            category[0].toUpperCase() + category.slice(1).toLowerCase()
          } Category Help`,
        })
        .setDescription(
          "Use `/support` to get an invite for our support server."
        )
        .addField("**Commands:**", "```" + commandsList.join(",\n") + "```")
        .setColor("BLURPLE")
        .setTimestamp();

      return { embeds: [commandsEmbed] };
    }
  },
};

function remove_by_value(array, val) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === val) {
      array.splice(i, 1);
      i--;
    }
  }
  return array;
}
