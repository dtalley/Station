#!/bin/env node

process.title = "Drone";

//Third-party modules
var fork = require("child_process").fork;
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js").Log;

//Generated common modules
var GeneratedCommon = require(__dirname + "/../common/generated_common_server.js");
var conf = GeneratedCommon.ConfigurationManager;

//Set up our configuration
conf.init(__dirname, {
    messageFile: __dirname + "/generated_messages_drone.js"
});

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
            this.processFlags |= Common.ProcessTypes[key].flag;
        }
    }

    this.server = new Server({
        type: Common.ProcessTypes.Drone
    });
    this.server.start();

    this.server.emitter.on("message", this.onMessage);
    this.server.emitter.on("master", this.onMasterConnected);

    if( ( this.processFlags & Common.ProcessTypes.Master.flag ) > 0 )
    {
        this.spawn({
            type: Common.ProcessTypes.Master
        });
    }
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
        var masterConnection = this.server.masterConnection;

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

            if( config.type == Common.ProcessTypes.Master )
            {
                Log.info("Master process exited.");

                if( connected )
                {
                    spawn({
                        type: Common.ProcessTypes.Master
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

                masterConnection.sendMessage(message);

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
        switch(connection.remoteType)
        {
            case Common.ProcessTypes.Master.id:
            {
                switch(message.id)
                {
                    case messages.SpawnProcess.id:
                    {
                        this.spawn({
                            type: Common.ProcessIndex[message.type],
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
