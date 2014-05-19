var nconf = require("nconf");

module.exports.init = function(path, defaults)
{
    nconf.argv()
         .env()
         .file("local", path + "/config.json")
         .file("common", path + "/../common/config.json")
         .defaults(defaults);

    return module.exports;
}

module.exports.get = function(id)
{
    return nconf.get(id);
}