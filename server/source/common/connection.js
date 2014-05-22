//Node modules
var net = require('net');
var EventEmitter = require("events").EventEmitter;

//Third-party modules
var _ = require("lodash");
var ws = require("ws");

//Common modules
var Common = require(__dirname + "/common.js");
var Log = require(__dirname + "/log.js").Log;
var conf = require(__dirname + "/conf.js");

//Generated common modules
var Processor = require(__dirname + "/generated_processor.js").Processor;

function Connection(messages) {
    _.bindAll(this);

    if( !messages )
    {
        Log.trace("Invalid connection created.");
        return;
    }

    this.messages = messages;
    this.emitter = new EventEmitter();

    this.verified = false;

    this.processor = new Processor(this.messages);
    this.processor.onMessage = this.onMessage;
    this.processor.onError = this.onError;

    this.packInfo = {};
}

Connection.prototype = {
    configure: function(config, socket, type) {
        this.protocol = config.protocol;
        this.sendMessage = this.sendMessageDefault;
        
        if( this.protocol === "websockets" )
        {
            this.socket = socket;

            this.host = this.socket._socket.remoteAddress;
            this.port = this.socket._socket.remotePort;
            this.remoteType = null;

            this.claimed = false;

            this.sendMessage = this.sendMessageWebSockets;
        }
        else if( socket )
        {
            this.socket = socket;

            this.host = this.socket.remoteAddress;
            this.port = this.socket.remotePort;
            this.remoteType = null;

            this.claimed = false;
        }
        else
        {
            this.socket = new net.Socket();

            this.host = config.host;
            this.port = config.port;
            this.remoteType = null;

            this.claimed = true;
        }

        if(config.remoteType===undefined)config.remoteType = null;
        this.expectedType = config.remoteType;
        this.localType = type;

        this.helloSent = false;
        this.helloReceived = false;

        this.socket.on("end", this.onSocketHalfClosed);
        this.socket.on("close", this.onSocketDisconnected);
        this.socket.on("error", this.onSocketError);

        if( this.protocol === "default" )
        {
            this.socket.on("data", this.onSocketData);
        }

        if( this.protocol === "websockets" )
        {
            this.socket.on("message", this.onSocketMessage);
            this.socket.on("ping", this.onSocketPing);
            this.socket.on("pong", this.onSocketPong);
        }
    },

    onMessage: function(msg) {
        if( msg.id === this.messages.Hello.id && !this.helloReceived )
        {
            this.helloReceived = true;
            Log.info("Received 'Hello' message from remote '" + Common.getProcessTitle(msg.type) + "' connection.");

            if( this.expectedType !== null && msg.type !== this.expectedType )
            {
                this.emitter.emit("reject", this, "Unexpected process type ID.  Received " + msg.type + ", expected " + this.expectedType);
                return;
            }

            this.remoteType = msg.type;
            this.spawnId = msg.spawnId;

            if( !this.helloSent )
            {
                Log.info("Responding with 'Hello' message to verified remote '" + Common.getProcessTitle(msg.type) + "' connection.");

                var message = this.messages.Hello.create();
                message.build = 0;
                message.type = this.localType;
                message.spawnId = conf.get("spawnId");
                
                this.sendMessage(message);

                this.helloSent = true;
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

    onError: function(text, error) {
        Log.error(error);

        if( error )
        {
            console.log(error);
        }
    },  

    claim: function() {
        this.claimed = true;
    },

    connect: function() {
        this.socket.on("connect", this.onSocketConnected);
        this.socket.connect(this.port, this.host);
    },

    disconnect: function() {
        if( this.protocol === "default" )
        {
            this.socket.end();
        }
        else if( this.protocol === "websockets" )
        {
            this.socket.terminate();
        }
        this.verified = false;
    },

    onSocketConnected: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " connected...");
        this.socket.removeListener("connect", this.onSocketConnected);
        this.emitter.emit("connect", this);
    },

    onSocketHalfClosed: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " ended on remote end...");
        this.disconnect();
        this.verified = false;
    },

    onSocketDisconnected: function() {
        Log.info("Socket to " + this.host + ":" + this.port + " disconnected...");
        this.emitter.emit("disconnect", this);
        this.verified = false;
    },

    onSocketError: function(e) {
        Log.info("Socket to " + this.host + ":" + this.port + " encountered an error...");

        this.disconnect();
    },

    onSocketData: function(data) {
        this.processor.process(data);
    },

    onSocketMessage: function(data, flags) {
        if( flags.binary )
        {
            this.processor.process(data);
        }
    },

    onSocketPing: function(ping) {
        this.socket.pong();
    },

    onSocketPong: function(pong) {

    },

    verify: function(expectedType) {
        if(expectedType===undefined)expectedType=null;
        this.expectedType = expectedType;

        var message = this.messages.Hello.create();
        message.build = 0;
        message.type = this.localType;
        message.spawnId = 0;
        
        this.sendMessage(message);

        this.helloSent = true;
    },

    sendMessageDefault: function(message) {
        var buffer = this.messages.index[message.id].pack(message, null, null, this.packInfo);

        this.socket.write(buffer.slice(0, this.packInfo.size));

        this.messages.returnBuffer(buffer);
    },

    sendMessageWebSockets: function(message) {
        var buffer = this.messages.index[message.id].pack(message, null, null, this.packInfo);

        this.socket.send(buffer.slice(0, this.packInfo.size), {binary:true});

        this.messages.returnBuffer(buffer);
    },

    destroy: function() {
        this.socket.removeListener("end", this.onSocketHalfClosed);
        this.socket.removeListener("close", this.onSocketDisconnected);
        this.socket.removeListener("error", this.onSocketError);

        this.disconnect();
        this.socket = null;

        this.emitter.emit("destroy", this);
    }
};

module.exports.Connection = Connection;