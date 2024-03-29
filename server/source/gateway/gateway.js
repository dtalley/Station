process.title = "Gateway";

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js").Log;
var conf = require(__dirname + "/../common/conf.js");

//Set up our configuration
conf.init(__dirname);

//Pull out our messages registry
var messages = require(conf.get("messageFile"));

function Gateway() {
    _.bindAll(this);

    this.server = new Server({
        listeners: [
            {
                name: "client",
                port: conf.get("ports:gateway:client"),
                protocol: "websockets"
            }
        ],

        type: Common.ProcessTypes.Gateway
    });
    this.server.start();

    this.server.listeners.client.emitter.on("connect", this.onClientConnection);
}

Gateway.prototype = {
    
};

_.extend(Gateway.prototype, {
    onClientConnection: function(listener, connection) {
        connection.claim();

        connection.emitter.on("verify", this.onClientConnectionVerified);
        connection.emitter.on("reject", this.onClientConnectionRejected);
        connection.emitter.on("disconnect", this.onClientConnectionLost);

        connection.verify(Common.ProcessTypes.Client.id);
    },

    onClientConnectionVerified: function(connection) {
        connection.emitter.on("message", this.onClientMessage);
    },

    onClientConnectionRejected: function(connection, reason) {
        Log.warn("Connection rejected: " + reason);

        this.closeClientConnection(connection);
    },

    onClientConnectionLost: function(connection) {
        this.closeClientConnection(connection);
    },

    closeClientConnection: function(connection) {
        connection.emitter.removeListener("verify", this.onClientConnectionVerified);
        connection.emitter.removeListener("reject", this.onClientConnectionRejected);
        connection.emitter.removeListener("disconnect", this.onClientConnectionLost);
        connection.emitter.removeListener("message", this.onClientMessage);

        connection.destroy();
    },

    onClientMessage: function(message, connection) {
        switch(message.id)
        {
            default:
                console.log(message);
        }
    }
});

var gateway = new Gateway();