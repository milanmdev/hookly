var { MessageEmbed, Constants } = require("discord.js");
var { REST } = require("@discordjs/rest");
var { Routes } = require("discord-api-types/v9");

module.exports = {
  error: (err) => {
    let embed = new MessageEmbed()
      .setTitle("<:redcross:765216959826100244> Error")
      .setDescription(`${err}`)
      .setColor("RED")
      .setTimestamp();

    return embed;
  },

  args: (interaction, input) => {
    return interaction.options._hoistedOptions.find((i) => i.name == input);
  },

  parsePermissions: (interaction, type, permissions) => {
    if (type == "client") {
      if (!permissions)
        return { string: null, permissions: null, hasPermissions: true };
      let permissionCheck = interaction.guild.me.permissions.has(permissions);

      let permissionsStr =
        permissions
          .map((perm) => {
            if (typeof perm == "bigint") return perm.toString();

            return perm
              .split("_")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
              )
              .join(" ");
          })
          .join(", ") || "No Permissions Required";

      return {
        string: permissionsStr,
        permissions: permissions,
        hasPermissions: permissionCheck,
      };
    } else {
      if (!permissions)
        return { string: null, permissions: null, hasPermissions: true };
      let permissionCheck = interaction.member.permissions.has(permissions);

      let permissionsStr =
        permissions
          .map((perm) => {
            if (typeof perm == "bigint") return perm.toString();

            return perm
              .split("_")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
              )
              .join(" ");
          })
          .join(", ") || "No Permissions Required";

      return {
        string: permissionsStr,
        permissions: permissions,
        hasPermissions: permissionCheck,
      };
    }
  },

  permissions: (type, permissions) => {
    if (type == "client") {
      var embed = new MessageEmbed()
        .setTitle("<:role:846230701702381589> Invalid Permissions")
        .setDescription(
          `I need the \`${permissions}\` permission to execute this command`
        )
        .setColor("FUCHSIA")
        .setTimestamp();
    } else {
      var embed = new MessageEmbed()
        .setTitle("<:role:846230701702381589> Invalid Permissions")
        .setDescription(
          `You need the \`${permissions}\` permission to use this command`
        )
        .setColor("FUCHSIA")
        .setTimestamp();
    }

    return embed;
  },

  validChannel: (channel, types) => {
    try {
      const channelTypesEnum = Constants.ChannelTypes;
      const channelTypeFetch = channelTypesEnum[channel.type];

      if (!types.includes(channelTypeFetch)) return false;
      return true;
    } catch (e) {
      return false;
    }
  },

  isOwner: async (client, user) => {
    let application = await client.application.fetch();
    if (typeof application?.owner == "object") {
      if (!application?.owner.members.get(user.id)) {
        return false;
      } else {
        return true;
      }
    } else {
      if (user.id !== application?.owner.id) {
        return false;
      } else {
        return true;
      }
    }
  },
};
