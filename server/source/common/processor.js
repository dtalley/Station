var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var Connection = require(__dirname + "/connection.js").Connection;
var Log = require(__dirname + "/log.js");

function Processor() {
    
}

_.extend(Processor.prototype, {
    
});

module.exports.Processor = Processor;