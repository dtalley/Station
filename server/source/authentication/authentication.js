process.title = "Authentication";

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;

//Generated common modules
var GeneratedCommon = require(__dirname + "/../common/generated_common_server.js");
var conf = GeneratedCommon.ConfigurationManager;

//Set up our configuration
conf.init(__dirname, {
    messageFile: __dirname + "/generated_messages_authentication.js"
});

function Authentication() {
    _.bindAll(this);

    this.server = new Server({
        type: Common.ProcessTypes.Authentication
    });

    this.server.emitter.on("connect", this.onConnection);
    this.server.emitter.on("message", this.onMessage);

    this.server.start();
}

Authentication.prototype = {
    
};

_.extend(Authentication.prototype, {
    onConnection: function(listener, connection) {
        connection.claim();

        connection.emitter.on("verify", this.onConnectionVerified);
        connection.emitter.on("reject", this.onConnectionRejected);
        connection.emitter.on("disconnect", this.onConnectionLost);

        connection.verify();
    },

    onConnectionVerified: function(connection) {
        
    },

    onConnectionRejected: function(connection, reason) {

    },

    onConnectionLost: function(connection) {
        
    },

    onMessage: function(message, connection) {
        
    }
});

var authentication = new Authentication();