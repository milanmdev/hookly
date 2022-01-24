var klaw = require("klaw");
var path = require("path");

module.exports = (client) => {
  let events = [];
  klaw("./events")
    .on("readable", function () {
      let item;
      while ((item = this.read())) {
        events.push(item.path);
      }
    })
    .on("end", function () {
      events.forEach((fp) => {
        if (fp.endsWith(".ts") == false) return;
        let evt = require(fp);
        let eName = path.basename(fp).replace(".ts", "");
        client.on(eName, evt.bind(null, client));
      });
    });
};
