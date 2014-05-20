//Third-party modules
var nconf = require("nconf");

function ConfigurationManager() {}

ConfigurationManager.prototype = {};

ConfigurationManager.prototype.init = function(path, defaults)
{
    nconf.argv()
         .env()
         .file("local", path + "/config.json")
         .file("common", path + "/../common/config.json")
         .defaults(defaults);

    return module.exports;
}

ConfigurationManager.prototype.get = function(id)
{
    return nconf.get(id);
}

var conf = module.exports.ConfigurationManager = new ConfigurationManager();

