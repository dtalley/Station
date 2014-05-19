process.title = "Master";

var nconf = require("nconf");

nconf.argv()
     .env()
     .file({ file: __dirname + "/config.json" })
     .file({ file: __dirname + "/../common/config.json" });

nconf.defaults({
    messageFile: __dirname + "/generated_messages_master.js"
});

var _ = require("lodash");
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;

function Master() {
    _.bindAll(this);

    this.server = new Server({
        listeners: [
            {
                port: nconf.get("ports:master")
            }
        ],

        type: ServerCommon.ProcessTypes.Master
    });

    this.server.emitter.on("connect", this.onConnection);

    this.server.start();
}

Master.prototype = {
    drones: []
};

_.extend(Master.prototype, {
    onConnection: function(listener, connection) {
        connection.claim();

        connection.emitter.on("verify", this.onConnectionVerified);
        connection.emitter.on("reject", this.onConnectionRejected);
        connection.emitter.on("disconnect", this.onConnectionLost);

        connection.verify();
    },

    onConnectionVerified: function(connection) {
        connection.emitter.on("message", this.onMessage);

        switch(connection.remoteType.id)
        {
            case ServerCommon.ProcessTypes.Drone.id:
                this.addDroneServer(connection);
                break;
        }
    },

    onConnectionRejected: function(connection, reason) {

    },

    onConnectionLost: function(connection) {
        switch(connection.localType.id)
        {
            case ServerCommon.ProcessTypes.Drone.id:
                this.removeDroneServer(connection);
                break;
        }
    },

    onMessage: function(message, connection) {
        
    },

    addDroneServer: function(connection) {

    },

    removeDroneServer: function(connection) {

    }
});

var master = new Master();