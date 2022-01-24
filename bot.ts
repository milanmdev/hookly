var Client = require("./structures/entities/client.ts");

var client = new Client({
  intents: ["GUILDS", "GUILD_WEBHOOKS"],
  allowedMentions: { repliedUser: false },
});

if (process.env.NODE_ENV == "production") {
  var token = client.config.token;
} else {
  var token = client.config.betaToken;
}

["events", "command"].forEach((handler) => {
  require(`./handlers/${handler}.ts`)(client);
});

client.login(token);
