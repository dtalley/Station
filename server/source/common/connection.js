var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;

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

    }
    else
    {
        this.socket = multiple;
    }
}

_.extend(Connection.prototype, {

});

module.exports.Connection = Connection;