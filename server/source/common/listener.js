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

    this.connectionPool = [];

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

        return this;
    },

    onBind: function() {
        Log.info("Listener bound on port " + this._config.port);
    },

    getConnection: function(socket) {
        var connection;
        if( this.connectionPool.length > 0 )
        {
            connection = this.connectionPool.pop();
        }
        else
        {
            connection = new Connection(this.messages);
            connection.emitter.on("destroy", this.reclaimConnection);
        }

        connection.configure({
            protocol: this._config.protocol
        }, socket, this._config.type.id);

        return connection;
    },

    reclaimConnection: function(connection) {
        this.connectionPool.push(connection);
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

        var ref = this.getConnection(socket);
        this.emitter.emit("connect", this, ref);

        if( !ref.claimed )
        {
            Log.trace("Connection not claimed, destroying...");
            ref.destroy();
        }
    }
});

module.exports.Listener = Listener;