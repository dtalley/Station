process.title = "Authentication";

//Set up our configuration
var conf = require(__dirname + "/../common/conf.js").init(__dirname, {
    messageFile: __dirname + "/generated_messages_authentication.js"
});

var _ = require("lodash");
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;

function Authentication() {
    _.bindAll(this);

    this.server = new Server({
        type: ServerCommon.ProcessTypes.Authentication
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