var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var Log = require(__dirname + "/log.js");

function Connection(multiple) {
    _.bindAll(this);

    if( !multiple )
    {
        return;
    }

    _.bindAll(this);

    this.emitter = new EventEmitter();

    if( typeof multiple === 'object' )
    {
        this.socket = new net.Socket();

        this.host = multiple.host;
        this.port = multiple.port;

        this.claimed = true;
    }
    else
    {
        this.socket = multiple;

        this.host = this.socket.remoteAddress;
        this.port = this.socket.remotePort;

        this.claimed = false;
    }

    this.socket.on("end", this.onSocketHalfClosed);
    this.socket.on("close", this.onSocketDisconnected);
    this.socket.on("error", this.onSocketError);
    this.socket.on("data", this.onSocketData);

    this.accepting = false;
}

_.extend(Connection.prototype, {
    claim: function() {
        this.claimed = true;
    },

    connect: function() {
        this.socket.on("connect", this.onSocketConnected);
        this.socket.connect(this.port, this.host);
    },

    onSocketConnected: function() {
        this.socket.removeListener("connect", this.onSocketConnected);
        this.emitter.emit("connect", this);
    },

    onSocketHalfClosed: function() {
        this.socket.end();
    },

    onSocketDisconnected: function() {
        this.emitter.emit("disconnect", this);
    },

    onSocketError: function() {
        Log.trace("Socket error!");
    },

    onSocketData: function(data) {
        Log.trace("Socket data!");
    },

    verify: function(options) {
        
    },

    destroy: function() {
        this.socket.removeListener("end", this.socketHalfClosed);
        this.socket.removeListener("close", this.socketDisconnected);
        this.socket.removeListener("error", this.socketError);

        this.socket.end();
    }
});

module.exports.Connection = Connection;