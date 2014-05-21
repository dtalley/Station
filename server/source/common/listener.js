//Node modules
var net = require('net');
var EventEmitter = require("events").EventEmitter;

//Third-party modules
var _ = require("lodash");
var WebSocketServer = require("ws").Server;

//Common modules
var Log = require(__dirname + "/log.js").Log;
var conf = require(__dirname + "/conf.js");
var Connection = require(__dirname + "/connection.js").Connection;

function Listener(options) {
    _.bindAll(this);

    this.name = options.name;

    this.messages = require(conf.get("messageFile"));

    this._config = _.defaults({}, options, {
        port: 8888,
        protocol: "default"
    });

    this.emitter = new EventEmitter();
}

Listener.prototype = {};

_.extend(Listener.prototype, {
    start: function() {
        if( this._config.protocol === "default" )
        {
            this.listener = net.createServer(this.onSocketConnection);
            this.listener.listen(this._config.port, this.onBind);
        }
        else if( this._config.protocol === "websockets" )
        {
            this.listener = new WebSocketServer({port: this._config.port}, this.onBind);
            this.listener.on("connection", this.onSocketConnection);
        }
    },

    onBind: function() {
        Log.info("Listener bound on port " + this._config.port);
    },

    onSocketConnection: function(socket) {
        if( socket._socket )
        {
            Log.info("Connection received on port " + this._config.port + " from " + socket._socket.remoteAddress + ":" + socket._socket.remotePort);
        }
        else
        {
            Log.info("Connection received on port " + this._config.port + " from " + socket.remoteAddress + ":" + socket.remotePort);
        }

        var ref = new Connection({
            protocol: this._config.protocol
        }, socket, this.messages, this._config.type.id);
        this.emitter.emit("connect", this, ref);

        if( !ref.claimed )
        {
            Log.trace("Connection not claimed, destroying...");
            ref.destroy();
        }
    }
});

module.exports.Listener = Listener;