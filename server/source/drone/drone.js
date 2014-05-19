#!/bin/env node

process.title = "Drone";

//Set up our configuration
var conf = require(__dirname + "/../common/conf.js").init(__dirname, {
    messageFile: __dirname + "/generated_messages_drone.js"
});

//Node modules
var fork = require("child_process").fork;
var _ = require("lodash");

//Common modules
var Connection = require(__dirname + "/../common/connection.js").Connection;
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js");

//Pull out our messages registry
var messages = require(conf.get("messageFile"));

function Drone() {
    _.bindAll(this);

    this.processes = [];
    this.pendingProcesses = [];

    this.directive = conf.get("directives")[conf.get("directive")];
    this.processFlags = 0;

    for( var key in this.directive.services )
    {
        if( this.directive.services[key] )
        {
            this.processFlags |= ServerCommon.ProcessTypes[key].flag;
        }
    }

    if( ( this.processFlags & ServerCommon.ProcessTypes.Master.flag ) > 0 )
    {
        this.spawn({
            type: ServerCommon.ProcessTypes.Master
        });
    }

    this.server = new Server({
        type: ServerCommon.ProcessTypes.Drone
    });
    this.server.start();

    this.server.emitter.on("message", this.onMessage);
    this.server.emitter.on("master", this.onMasterConnected);
}

Drone.prototype = {};

_.extend(Drone.prototype, {
    spawn: function(config) {
        if( !config.type )
        {
            throw new Error("Invalid process type provided to spawn()");
        }

        if( ( this.processFlags & config.type.flag ) == 0 )
        {
            throw new Error("Unsupported process type requested for spawn: '" + config.type.title + "'");
        }

        Log.info("Drone spawning process of type '" + config.type.title + "'");

        var args = [];

        if( config.spawnId )
        {
            args.push("--spawnId");
            args.push(config.spawnId);
        }

        var process = fork(__dirname + "/../" + config.type.name + "/" + config.type.name + ".js", args);
        this.pendingProcesses.push(process);

        var pendingProcesses = this.pendingProcesses;
        var processes = this.processes;
        var spawn = this.spawn;

        var connected = false;

        process.on("message", function(message){
            if( message.event == "connect" )
            {
                pendingProcesses.splice(pendingProcesses.indexOf(process), 1);
                processes.push(process);

                Log.info("Drone successfully spawned '" + config.type.title + "'.");

                connected = true;
            }
        });

        process.on("error", function(e){

        });

        process.on("exit", function(e){
            if( connected )
            {
                processes.splice(processes.indexOf(process), 1);
            }
            else
            {
                pendingProcesses.splice(pendingProcesses.indexOf(process), 1);
            }

            if( config.type == ServerCommon.ProcessTypes.Master )
            {
                Log.info("Master process exited.");

                if( connected )
                {
                    spawn({
                        type: ServerCommon.ProcessTypes.Master
                    });
                }
                else
                {
                    Log.info("Drone failed to spawn Master process.");
                }
            }
            else
            {
                var message = messages.ProcessExited.create();
                message.spawnId = config.spawnId;
                message.type = config.type;

                this.server.masterConnection.sendMessage(message);

                message.release();
            }
        });
    },

    onMasterConnected: function(connection) {
        var message = messages.DroneIdentify.create();
        message.flags = this.processFlags;

        connection.sendMessage(message);

        message.release();
    },

    onMessage: function(message, connection) {
        switch(connection.remoteType.id)
        {
            case ServerCommon.ProcessTypes.Master.id:
            {
                switch(message.id)
                {
                    case messages.SpawnProcess.id:
                    {
                        this.spawn({
                            type: ServerCommon.ProcessIndex[message.type],
                            spawnId: message.spawnId
                        });
                    }
                    break;
                }
            }
            break;
        }
    }
});

var drone = new Drone();
