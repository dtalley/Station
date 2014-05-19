var _ = require("lodash");
var net = require('net');
var ServerCommon = require(__dirname + "/common.js");
var EventEmitter = require("events").EventEmitter;
var Log = require(__dirname + "/log.js");
var Processor = require(__dirname + "/processor.js").Processor;
var conf = require(__dirname + "/conf.js");

var messages = require(conf.get("messageFile"));

function Connection(multiple, type) {
    _.bindAll(this);

    if( !multiple )
    {
        Log.trace("Invalid connection created.");
        return;
    }

    this.emitter = new EventEmitter();

    if( multiple instanceof net.Socket )
    {
        this.socket = multiple;

        this.host = this.socket.remoteAddress;
        this.port = this.socket.remotePort;
        this.remoteType = null;

        this.claimed = false;
    }
    else
    {
        this.socket = new net.Socket();

        this.host = multiple.host;
        this.port = multiple.port;
        this.remoteType = multiple.remoteType;

        this.claimed = true;
    }

    this.localType = type;

    this.socket.on("end", this.onSocketHalfClosed);
    this.socket.on("close", this.onSocketDisconnected);
    this.socket.on("error", this.onSocketError);
    this.socket.on("data", this.onSocketData);

    this.verified = false;

    this.processor = new Processor();
    this.processor.emitter.on("message", this.onMessage);
    this.processor.emitter.on("error", this.onError);
}

Connection.prototype = {};

_.extend(Connection.prototype, {
    onMessage: function(msg) {
        if( msg.id === messages.Hello.id && !this.verified )
        {
            var type = ServerCommon.ProcessIndex[msg.type];
            Log.info("Received 'Hello' message from remote '" + type.title + "' server.");

            if( this.remoteType === null )
            {
                if( msg.type >= ServerCommon.ProcessIndex.length )
                {
                    this.emitter.emit("reject", this, "Invalid process type ID.");
                    return;
                }

                this.remoteType = ServerCommon.ProcessIndex[msg.type];

                this.spawnId = msg.spawnId;
            }
            else if( msg.type === this.remoteType.id )
            {
                Log.info("Responding with 'Hello' message to verified remote '" + type.title + "'.");

                var message = messages.Hello.create();
                message.build = 0;
                message.type = this.localType.id;
                message.spawnId = conf.get("spawnId");
                
                this.sendMessage(message);
            }
            else
            {
                this.emitter.emit("reject", this, "Unexpected process type ID.");
                return;
            }

            this.verified = true;
            this.emitter.emit("verify", this);
        }
        else if( this.verified )
        {
            this.emitter.emit("message", msg, this);
        }
        else
        {
            Log.warn("Message received before initial handshake.");
        }
    },

    onError: function(error) {
        Log.error(error);
    },

    claim: function() {
        this.claimed = true;
    },

    connect: function() {
        this.socket.on("connect", this.onSocketConnected);
        this.socket.connect(this.port, this.host);
    },

    disconnect: function() {
        this.socket.end();
        this.verified = false;
    },

    onSocketConnected: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " connected...");
        this.socket.removeListener("connect", this.onSocketConnected);
        this.emitter.emit("connect", this);
    },

    onSocketHalfClosed: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " ended on remote end...");
        this.socket.end();
        this.verified = false;
    },

    onSocketDisconnected: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " disconnected...");
        this.emitter.emit("disconnect", this);
        this.verified = false;
    },

    onSocketError: function(e) {
        Log.info("Socket to " + this.host + ":" + this.port + " encountered an error...");

        this.socket.end();
    },

    onSocketData: function(data) {
        this.processor.process(data);
    },

    verify: function(options) {
        var message = messages.Hello.create();
        message.build = 0;
        message.type = this.localType.id;
        message.spawnId = 0;
        
        this.sendMessage(message);
    },

    sendMessage: function(message) {
        var size = message.pack();

        this.socket.write(message.buffer.slice(0, size));
    },

    destroy: function() {
        this.socket.removeListener("end", this.socketHalfClosed);
        this.socket.removeListener("close", this.socketDisconnected);
        this.socket.removeListener("error", this.socketError);

        this.socket.end();

        this.processor.destroy();
    }
});

module.exports.Connection = Connection;