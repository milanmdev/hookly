var { Client, Collection } = require("discord.js");
var fs = require("fs");

class Application extends Client {
  constructor(options) {
    super(options || []);
    this.commands = new Collection();
    this.categories = fs.readdirSync("./commands/");

    this.config = require("../../config.json");
    this.package = require("../../package.json");

    this.functions = require("./../functions.ts");
    this.deployCommands = require("./deploy-commands.ts");
  }
}

module.exports = Application;
