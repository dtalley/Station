process.title = "Master";

var _ = require("lodash");
var nconf = require("nconf");
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;

nconf.argv()
     .env()
     .file({ file: __dirname + "/config.json" })
     .file({ file: __dirname + "/../common/config.json" });

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

_.extend(Master.prototype, {
    onConnection: function(listener, connection) {
        connection.claim();

        connection.emitter.on("verify", this.onCennectionVerified);
        connection.emitter.on("reject", this.onConnectionRejected);

        connection.verify();
    },

    onCennectionVerified: function(connection) {

    },

    onConnectionRejected: function(connection) {

    },

    onMessage: function(message, connection) {
        console.log("Message received.");
    }
});

var master = new Master();