//Node modules
var net = require('net');
var EventEmitter = require("events").EventEmitter;

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/common.js");
var Listener = require(__dirname + "/listener.js").Listener;
var Log = require(__dirname + "/log.js").Log;
var conf = require(__dirname + "/conf.js");
var Connection = require(__dirname + "/connection.js").Connection;

function Server(options) {
    _.bindAll(this);

    this.messages = require(conf.get("messageFile"));
    this.emitter = new EventEmitter();

    this._config = _.defaults({}, options, {
        listeners: []
    });

    this.listeners = {};

    this.target = conf.get("targets")[conf.get("target")];

    this.masterConnection = null;
}

Server.prototype = {};

_.extend(Server.prototype, {
    start: function() {
        this._config.listeners.forEach(function(listener){
            this.listeners[listener.name] = new Listener({
                port: listener.port,
                type: this._config.type,
                protocol: listener.protocol
            }).start();
        }, this);

        if( this._config.type === Common.ProcessTypes.Master )
        {
            process.send({event: "connect"});
        }
        else
        {
            this.masterConnection = new Connection(this.messages);
            this.masterConnection.configure({
                host: this.target.masterAddress,
                port: conf.get("ports:master"),
                remoteType: Common.ProcessTypes.Master.id,
                protocol: "default"
            }, null, this._config.type.id)

            Log.info("Connecting to Master at " + this.masterConnection.host + ":" + this.masterConnection.port);

            this.masterConnection.emitter.on("disconnect", this.onMasterDisconnected);
            this.masterConnection.emitter.on("verify", this.onMasterVerified);
            this.masterConnection.emitter.on("reject", this.onMasterRejected);

            this.masterConnection.connect();
        }
    },

    onMasterDisconnected: function() {
        this.masterConnection.connect();
    },

    onMasterVerified: function(connection) {
        Log.info("Connection to Master verified.");

        if( process.send ) process.send({event: "connect"});

        this.emitter.emit("master", this.masterConnection);
    },

    onMasterRejected: function(connection, reason) {
        throw new Error("Connection to Master rejected: " + reason);
    }
});

module.exports.Server = Server;