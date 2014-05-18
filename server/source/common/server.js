var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var ServerCommon = require(__dirname + "/common.js");
var Connection = require(__dirname + "/connection.js").Connection;
var Listener = require(__dirname + "/listener.js").Listener;

function Server(options) {
    _.bindAll(this);

    this.emitter = new EventEmitter();

    this._config = _.defaults({}, options, {
        listeners: []
    });
}

_.extend(Server.prototype, {
    start: function() {
        this._config.listeners.forEach(function(listener){
            listener.listener = new Listener({
                port: listener.port
            });

            listener.listener.start();
        }, this);

        if( this._config.type == ServerCommon.ProcessTypes.Master )
        {
            process.send({
                type: "connected"
            });
        }
        else
        {

        }
    }
});

module.exports.Server = Server;