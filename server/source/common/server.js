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

    this.target = conf.get("targets")[conf.get("target")];

    this.masterConnection = null;
}

Server.prototype = {};

_.extend(Server.prototype, {
    start: function() {
        this._config.listeners.forEach(function(listener){
            listener.listener = new Listener({
                port: listener.port,
                type: this._config.type,
                protocol: listener.protocol
            });

            listener.listener.start();

            listener.listener.emitter.on("connect", this.onConnection);
        }, this);

        if( this._config.type === Common.ProcessTypes.Master )
        {
            this.onMasterVerified();
        }
        else
        {
            this.masterConnection = new Connection({
                host: this.target.masterAddress,
                port: conf.get("ports:master"),
                remoteType: Common.ProcessTypes.Master.id,
                protocol: "default"
            }, null, this.messages, this._config.type.id);

            Log.info("Connecting to Master at " + this.masterConnection.host + ":" + this.masterConnection.port);

            this.masterConnection.emitter.on("connect", this.onConnectedToMaster);
            this.masterConnection.emitter.on("disconnect", this.onMasterDisconnected);
            this.masterConnection.emitter.on("message", this.onMessage);

            this.masterConnection.connect();
        }
    },

    onConnection: function(listener, connection) {
        this.emitter.emit("connect", listener, connection);

        connection.emitter.on("message", this.onMessage);
        connection.emitter.on("destroy", this.onDestroyConnection);
    },

    onConnectedToMaster: function() {
        this.masterConnection.emitter.on("verify", this.onMasterVerified);
        this.masterConnection.emitter.on("reject", this.onMasterRejected);
    },

    onMasterDisconnected: function() {
        this.masterConnection.connect();
    },

    onMasterVerified: function(connection) {
        if( process.send )
        {
            Log.info("Connection to Master verified.");

            process.send({
                event: "connect"
            });
        }

        this.emitter.emit("master", this.masterConnection);
    },

    onMasterRejected: function(connection) {

    },

    onMessage: function(message, connection) {
        this.emitter.emit("message", message, connection);
    },

    onDestroyConnection: function(connection) {

    }
});

module.exports.Server = Server;