//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/common/common.js");

//Generated common modules
var messages = require(__dirname + "/generated/generated_messages_client_index.js");

function Client() {
    _.bindAll(this);
}

Client.prototype = {
    start: function() {
        
    }
};

module.exports = new Client();