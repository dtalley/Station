process.title = "Master";

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js").Log;
var conf = require(__dirname + "/../common/conf.js");

//Set up our configuration
conf.init(__dirname);

var messages = require(conf.get("messageFile"));

function Master() {
    _.bindAll(this);

    this.server = new Server({
        listeners: [
            {
                name: "master",
                port: conf.get("ports:master"),
                protocol: "default"
            }
        ],

        type: Common.ProcessTypes.Master
    });
    this.server.start();

    this.server.listeners.master.emitter.on("connect", this.onConnection);
}

Master.prototype = {
    drones: [],
    gateway: null,
    authentication: null,

    spawnId: 1,
    spawnRequests: {}
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
        switch(connection.remoteType)
        {
            case Common.ProcessTypes.Drone.id:
            {
                this.addDroneServer(connection);
            }
            break;

            case Common.ProcessTypes.Gateway.id:
            {
                this.addGatewayServer(connection);
            }
            break;

            case Common.ProcessTypes.Authentication.id:
            {
                this.addAuthenticationServer(connection);
            }
            break;
        }

        if( connection.spawnId && this.spawnRequests[connection.spawnId] )
        {
            Log.info("Requested process #" + connection.spawnId + " has connected successfully.");
        }
    },

    onConnectionRejected: function(connection, reason) {
        this.closeConnection(connection);
    },

    onConnectionLost: function(connection) {
        switch(connection.localType)
        {
            case Common.ProcessTypes.Drone.id:
                this.removeDroneServer(connection);
                break;

            case Common.ProcessTypes.Gateway.id:
                this.removeGatewayServer(connection);
                break;

            case Common.ProcessTypes.Authentication.id:
                this.removeAuthenticationServer(connection);
                break;
        }

        this.closeConnection(connection);
    },

    closeConnection: function(connection) {
        connection.emitter.removeListener("verify", this.onConnectionVerified);
        connection.emitter.removeListener("reject", this.onConnectionRejected);
        connection.emitter.removeListener("disconnect", this.onConnectionLost);
        connection.emitter.removeListener("message", this.onMessage);

        connection.destroy();
    },

    addDroneServer: function(connection) {
        this.drones.push(connection);

        connection.emitter.on("message", this.onDroneMessage);
    },

    onDroneMessage: function(message, connection) {
        switch(message.id)
        {
            case messages.DroneIdentify.id:
            {
                this.enableDroneServer(message, connection);
            }
            break;

            case messages.ProcessExited.id:
            {
                this.processExited(message);
            }
            break;

            case messages.ProcessSpawned.id:
            {
                this.processSpawned(message);
            }
            break;
        }
    },

    enableDroneServer: function(msg, connection) {
        connection.flags = msg.flags;

        if( !this.gateway && ( msg.flags & Common.ProcessTypes.Gateway.flag ) > 0 )
        {
            this.spawnProcess({
                type: Common.ProcessTypes.Gateway
            }, connection);
        }

        if( !this.authentication && ( msg.flags & Common.ProcessTypes.Authentication.flag ) > 0 )
        {
            this.spawnProcess({
                type: Common.ProcessTypes.Authentication
            }, connection);
        }
    },

    removeDroneServer: function(connection) {
        connection.emitter.removeListener("message", this.onDroneMessage);

        this.drones.splice(this.drones.indexOf(connection), 1);

        Log.warn("Master lost connection to Drone at " + connection.socket.remoteAddress + ":" + connection.socket.remotePort);
    },

    addAuthenticationServer: function(msg, connection) {

    },

    removeAuthenticationServer: function(connection) {

    },

    addGatewayServer: function(msg, connection) {

    },

    removeGatewayServer: function(connection) {

    },

    spawnProcess: function(config, drone) {
        var message = messages.SpawnProcess.create();
        message.spawnId = this.spawnId++;
        message.type = config.type.id;

        Log.info("Requesting Drone to spawn a '" + config.type.title + "' process with spawn ID #" + message.spawnId);

        drone.sendMessage(message);

        this.spawnRequests[message.spawnId] = config;
        config.time = new Date().getTime();

        if( this.spawnId > 0xFFFFFFFF )
        {
            this.spawnId = 1;
        }
    },

    processExited: function(msg) {

    },

    processSpawned: function(msg) {

    },

    addGatewayServer: function(connection) {
        this.gateway = connection;
    }
});

var master = new Master();