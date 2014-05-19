var _ = require("lodash");
var net = require('net');
var nconf = require("nconf");
var EventEmitter = require("events").EventEmitter;
var ServerCommon = require(__dirname + "/common.js");
var Connection = require(__dirname + "/connection.js").Connection;
var Listener = require(__dirname + "/listener.js").Listener;
var Log = require(__dirname + "/log.js");

function Server(options) {
    _.bindAll(this);

    this.emitter = new EventEmitter();

    this._config = _.defaults({}, options, {
        listeners: []
    });

    this.target = nconf.get("targets")[nconf.get("target")];

    this.masterConnection = null;
}

Server.prototype = {};

_.extend(Server.prototype, {
    start: function() {
        this._config.listeners.forEach(function(listener){
            listener.listener = new Listener({
                port: listener.port,
                type: this._config.type
            });

            listener.listener.start();

            listener.listener.emitter.on("connect", this.onConnection);
        }, this);

        if( this._config.type === ServerCommon.ProcessTypes.Master )
        {
            this.onMasterVerified();
        }
        else
        {
            this.masterConnection = new Connection({
                host: this.target.masterAddress,
                port: nconf.get("ports:master"),
                remoteType: ServerCommon.ProcessTypes.Master
            }, this._config.type);

            this.masterConnection.emitter.on("connect", this.onConnectedToMaster);
            this.masterConnection.emitter.on("disconnect", this.onMasterDisconnected);

            this.masterConnection.connect();
        }
    },

    onConnection: function(listener, connection) {
        this.emitter.emit("connect", listener, connection);
    },

    onConnectedToMaster: function() {
        this.masterConnection.emitter.on("verify", this.onMasterVerified);
        this.masterConnection.emitter.on("reject", this.onMasterRejected);
    },

    onMasterDisconnected: function() {

    },

    onMasterVerified: function(connection) {
        if( process.send )
        {
            Log.info("Connection to Master verified.");

            process.send({
                event: "connect"
            });
        }
    },

    onMasterRejected: function(connection) {

    }
});

module.exports.Server = Server;