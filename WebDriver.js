module.exports = class WebDriver
{
  constructor(app, port, kbFile)
  {
    this.app = app;
    this.kbFile = kbFile;

    this.expressApp = express()
    //this.expressApp.use(bodyParser.json());
    //this.expressApp.use(bodyParser.urlencoded({ extended: true }));
    this.expressApp.use(express.static('public'));

    this.expressApp.listen(port, () => console.log('Example app listening on port ' + port))

    var fs = require("fs");

    this.expressApp.use(express.static('public'))
    this.expressApp.get('/kb.json', (req, res) => {
      res.sendFile(path.join(__dirname, this.kbFile));
    });
    this.expressApp.get('/[\$]*', function(req, res) {
      res.sendFile(path.join(__dirname, "public", "/index.html"));
    });
  }
}

const express = require('express')
//var jp = require("jsonpath");
//var bodyParser = require("body-parser");
var path = require("path");
