//Node modules
var net = require('net');
var EventEmitter = require("events").EventEmitter;

//Third-party modules
var _ = require("lodash");

//Common modules
var Log = require(__dirname + "/log.js").Log;

//Generated common modules
var GeneratedCommon = require(__dirname + "/../common/generated_common_server.js");
var Connection = GeneratedCommon.Connection;

function Listener(options) {
    _.bindAll(this);

    this._config = _.defaults({}, options, {
        port: 8888
    });

    this.emitter = new EventEmitter();
}

Listener.prototype = {};

_.extend(Listener.prototype, {
    start: function() {
        this.listener = net.createServer(this.onConnection);
        this.listener.listen(this._config.port, this.onBind);
    },

    onBind: function() {
        Log.info("Listener bound on port " + this._config.port);
    },

    onConnection: function(socket) {
        Log.info("Connection received on port " + this._config.port + " from " + socket.remoteAddress + ":" + socket.remotePort);

        var ref = new Connection(socket, this._config.type.id);
        this.emitter.emit("connect", this, ref);

        if( !ref.claimed )
        {
            Log.trace("Connection not claimed, destroying...");
            ref.destroy();
        }
    }
});

module.exports.Listener = Listener;