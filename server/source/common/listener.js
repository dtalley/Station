var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var Connection = require(__dirname + "/connection.js").Connection;
var Log = require(__dirname + "/log.js");

function Listener(options) {
    _.bindAll(this);

    this._config = _.defaults({}, options, {
        port: 8888
    });

    this.emitter = new EventEmitter();
}

_.extend(Listener.prototype, {
    start: function() {
        this.listener = net.createServer(this.onConnection);
        this.listener.listen(this._config.port, this.onBind);
    },

    onBind: function() {
        Log.info("Listener bound on port " + this._config.port);
    },

    onConnection: function(connection) {
        var ref = new Connection(connection);
        this.emit("connection", ref);

        if( !ref.claimed )
        {
            ref.destroy();
        }
    }
});

module.exports.Listener = Listener;