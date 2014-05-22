//Third-party modules
var nconf = require("nconf");
var _ = require("lodash");

function ConfigurationManager() {
    _.bindAll(this);
}

ConfigurationManager.prototype = {
    init: function(path, defaults)
    {
        nconf.argv()
             .env()
             .file("local", path + "/config.json")
             .file("common", path + "/../common/config.json")
             .defaults(defaults)
             .defaults({
                messageFile: path + "/gen/messages.js"
             });

        return module.exports;
    },

    get: function(id)
    {
        return nconf.get(id);
    }
}

module.exports = new ConfigurationManager();