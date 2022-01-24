import Types from "@types";

import chalk from "chalk";
var { ShardingManager } = require("discord.js");
var Statcord = require("statcord.js");

var config = require("./config.json");

if (process.env.NODE_ENV == "production") {
  var token = config.token;
} else {
  var token = config.betaToken;
}

var manager = new ShardingManager("./bot.ts", {
  token: token,
  respawn: true,
});

if (process.env.NODE_ENV == "production") {
  var statcord = new Statcord.ShardingClient({
    key: config.statcordToken,
    manager: manager,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true,
    debug: {
      enabled: false,
    },
  });
}

manager.on("shardCreate", (shard: Types["Shard"]) => {
  console.log(
    chalk.hex("#5865F2").bold("[Hookly] ") +
      `Spawned shard ${chalk.bold(shard.id)}`
  );
  shard.on("ready", () => {
    console.log(
      chalk.hex("#5865F2").bold("[Hookly] ") +
        chalk.bold(`[Shard ${shard.id}] `) +
        `Shard ready`
    );
  });
  shard.on("disconnect", (a, b) => {
    console.log(
      chalk.hex("#5865F2").bold("[Hookly] ") +
        chalk.bold(`[Shard ${shard.id}] `) +
        `Shard disconnected`
    );
  });
  shard.on("reconnecting", (a, b) => {
    console.log(
      chalk.hex("#5865F2").bold("[Hookly] ") +
        chalk.bold(`[Shard ${shard.id}] `) +
        `Shard reconnecting`
    );
  });
  shard.on("death", (a, b) => {
    console.log(
      chalk.hex("#5865F2").bold("[Hookly] ") +
        chalk.bold(`[Shard ${shard.id}] `) +
        `Shard died`
    );
  });
});

manager.on("message", (shard, message) => {
  console.log(
    chalk.hex("#5865F2").bold("[Hookly] ") +
      `[${chalk.bold(shard.id)}] ${message._eval} : ${message._result}`
  );
});

manager.spawn().catch(console.error);

if (process.env.NODE_ENV == "production") {
  statcord.on("autopost-start", () => {
    console.log(
      chalk.hex("#a6c941").bold("[Statcord.com] ") + "Started autopost"
    );
  });

  statcord.on("post", (status) => {
    if (!status)
      console.log(
        chalk.hex("#a6c941").bold("[Statcord.com] ") +
          "Posted stats to Statcord!"
      );
    else
      console.log(
        chalk.hex("#a6c941").bold("[Statcord.com] ") +
          `There was an error posting stats to Statcord: ${status}`
      );
  });
}
