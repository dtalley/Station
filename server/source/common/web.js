var _ = require("lodash");
var EventEmitter = require("events").EventEmitter;
var Log = require(__dirname + "/log.js");
var WSS = require('ws').Server;
var http = require("http");
var express = require("express");

function WebSocketServer(options) {
    _.bindAll(this);

    this.port = options.port;

    this.emitter = new EventEmitter();
}

WebSocketServer.prototype = {};

_.extend(WebSocketServer.prototype, {
    start: function() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.http.listen(this.port);

        this.wss = new WSS({
            server: this.http
        });

        this.wss.on("connection", this.onConnection);
    },

    onConnection: function(socket) {
        Log.info("Web socket connection received...");
    }
});

module.exports.WebSocketServer = WebSocketServer;