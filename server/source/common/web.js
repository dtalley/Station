//Node modules
var EventEmitter = require("events").EventEmitter;
var http = require("http");

//Third-party modules
var _ = require("lodash");
var WSS = require('ws').Server;
var express = require("express");

//Generated common modules
var Log = require(__dirname + "/generated_common_server.js").Log;

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