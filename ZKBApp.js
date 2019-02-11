module.exports = class ZKBApp
{
  //TODO: when using set, have "are you sure" message showing the number of bytes in that document
  constructor(config)
  {
    this.config = config;

    this.kbFile = config.kbFile;
    var json = JSON.parse(fs.readFileSync(this.kbFile));
    this.kb = new ZKB(json);
    //TODO: make kbFile not have to be local.. due to express
    //TODO: customizable prefix for bot?
    //TODO: host and zkb link
    //TODO: fix a bug where /$ nad / don't show the root node's data in the markdown panel
    //TODO: backup system
    //TODO: zkb path parsing (links to other documents in md)
    //TODO: web server rest api (get list of keys, dont load full json file, etc)
    this.botDriver = new BotDriver(this, config.token, config.users);
    this.webDriver = new WebDriver(this, config.port, config.kbFile);
  }

  save()
  {
    fs.writeFileSync(this.kbFile, JSON.stringify(this.kb.root, null, 2));
  }

  //TODO: max (sub) level parameter?
  idsToYaml(node, level)
  {
    node = node || this.kb.root;
    level = level || 0;

    var str = "";

    Object.keys(node.children).forEach((e) =>
    {
      for(var i = 0; i < level; i++)
      {
        str += "  ";
      }

      str += "- ";

      str += e + "\n";
      str += this.idsToYaml(node.children[e], level + 1);
    });

    return str;
  }

  //TODO: also make ids to list.. returns list of full paths
}

var fs = require("fs");
var ZKB = require("./ZKB.js");
var BotDriver = require("./BotDriver.js");
var WebDriver = require("./WebDriver.js");
