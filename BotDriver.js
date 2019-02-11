module.exports = class BotDriver
{
  //TODO custom error class i guess
  constructor(app, token, users)
  {
    this.app = app;
    this.users = users;

    this.bot = new Eris(token);

    this.bot.on("ready", () => { // When the bot is ready
        console.log("Ready!"); // Log "Ready!"
    });

    this.bot.on("messageCreate", (msg) => this.handleMessage(msg));

    this.bot.connect();
  }

  handleMessage(msg)
  {
    var authed = this.users.includes(msg.author.id);

    var command = msg.content.split(/\s+/);
    //TODO: ignore caps for commands
    if(command[0] != "zkb")
    {
      return;
    }

    if(command[1] == "get")
    {
      this.getCommand(msg, command[2]);
    }
    if(command[1] == "getmd")
    {
      this.getCommand(msg, command[2], true);
    }
    else if(command[1] == "set")
    {
      if(!authed)
      {
        this.bot.createMessage(msg.channel.id, "Sorry, you're not in the list of allowed ids.");
        return;
      }
      //TODO: handle spaces correctly
      var c = msg.content;
      this.setCommand(msg, command[2], c.substring(c.indexOf(command[2]) + command[2].length));
    }
    else if(command[1] == "setmd")
    {
      if(!authed)
      {
        this.bot.createMessage(msg.channel.id, "Sorry, you're not in the list of allowed ids.");
        return;
      }

      if(msg.attachments == null || msg.attachments.length == 0)
      {
        this.bot.createMessage(msg.channel.id, "You need to send a markdown file with your message.");
        return;
      }

      var url = msg.attachments[0].url

      request(url, (error, response, body) => {
        if(error)
        {
          console.log('error:', error);
          this.bot.createMessage(msg.channel.id, "There was an error when downloading the file.");
          return
        }
        //console.log(command)
        this.setCommand(msg, command[2], body);
      });
    }
    else if(command[1] == "delete")
    {
      if(!authed)
      {
        this.bot.createMessage(msg.channel.id, "Sorry, you're not in the list of allowed ids.");
        return;
      }
      //TODO: handle spaces correctly
      var c = msg.content;
      this.deleteCommand(msg, command[2]);
    }
    else if(command[1] == "move")
    {
      if(!authed)
      {
        this.bot.createMessage(msg.channel.id, "Sorry, you're not in the list of allowed ids.");
        return;
      }
      //TODO: handle spaces correctly
      var c = msg.content;
      this.moveCommand(msg, command[2], command[3]);
    }
    else if(command[1] == "tree")
    {
      this.treeCommand(msg);
    }
  }

  moveCommand(msg, srcPath, dstPath)
  {
    try
    {
      srcPath = srcPath.trim();
      dstPath = dstPath.trim();
      console.log("move", srcPath, dstPath);
      //console.log(this.app.kb.get(path));
      this.app.kb.move(srcPath, dstPath);

      //save
      this.app.save();
      this.bot.createMessage(msg.channel.id, "ok");
    }
    catch(e)
    {
      this.bot.createMessage(msg.channel.id, e.toString());
    }
  }

  deleteCommand(msg, path)
  {
    try
    {
      path = path.trim();
      console.log("delete", path);
      this.app.kb.deleteNode(path);

      //save
      this.app.save();
      this.bot.createMessage(msg.channel.id, "ok");
    }
    catch(e)
    {
      this.bot.createMessage(msg.channel.id, e.toString());
    }
  }

  getCommand(msg, path, md)
  {
    try
    {
      path = path.trim();
      console.log("get", path);
      //console.log(this.app.kb.get(path));
      var data = this.app.kb.get(path);
      if(md)
      {
        var file = {
          name: path + ".md",
          file: Buffer.from(data, 'utf8')
        }
        this.bot.createMessage(msg.channel.id, "", file);
      }
      else
      {
        this.bot.createMessage(msg.channel.id, "```\n" + data + "```");
      }
    }
    catch(e)
    {
      console.log(e)
      this.bot.createMessage(msg.channel.id, e.toString());
    }
  }

  setCommand(msg, path, data)
  {
    try
    {
      path = path.trim();
      data = data.trim();
      console.log("set", path, data);
      this.app.kb.set(path, data);

      //save
      this.app.save();
      //TODO: change to response
      this.bot.createMessage(msg.channel.id, "ok");
    }
    catch(e)
    {
      //this.bot.createMessage(msg.channel.id, "The given path was invalid or another error occurred.");
      this.bot.createMessage(msg.channel.id, e);
    }
  }

  //TODO: create a method in zkb/app that prints a yaml string
  treeCommand(msg, node, level)
  {
    var yaml = this.app.idsToYaml(node);
    //TODO: rename root? idk
    this.bot.createMessage(msg.channel.id, "```yaml\nroot\n" + yaml + "```");
  }
}

const Eris = require("eris");
//var request = require("request");
