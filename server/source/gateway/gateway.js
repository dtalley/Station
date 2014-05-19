process.title = "Gateway";

//Set up our configuration
var conf = require(__dirname + "/../common/conf.js").init(__dirname, {
    messageFile: __dirname + "/generated_messages_gateway.js"
});

//Third-party modules
var _ = require("lodash");

//Common modules
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var WebSocketServer = require(__dirname + "/../common/web.js").WebSocketServer;

function Gateway() {
    _.bindAll(this);

    this.server = new Server({
        type: ServerCommon.ProcessTypes.Gateway
    });

    this.server.emitter.on("connect", this.onConnection);
    this.server.emitter.on("message", this.onMessage);

    this.server.start();

    this.wss = new WebSocketServer({
        port: conf.get("ports:gateway:client")
    });

    this.wss.start();
}

Gateway.prototype = {
    
};

_.extend(Gateway.prototype, {
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

var gateway = new Gateway();