process.title = "Drone";

var nconf = require("nconf");

nconf.argv()
     .env()
     .file({ file: __dirname + "/config.json" })
     .file({ file: __dirname + "/../common/config.json" });

nconf.defaults({
    messageFile: __dirname + "/generated_messages_drone.js"
});

var fork = require("child_process").fork;
var _ = require("lodash");
var Connection = require(__dirname + "/../common/connection.js").Connection;
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js");

function Drone() {
    _.bindAll(this);

    this.processes = [];
    this.pendingProcesses = [];

    this.spawn({
        type: ServerCommon.ProcessTypes.Master
    });

    this.server = new Server({
        type: ServerCommon.ProcessTypes.Drone
    });
    this.server.start();
}

Drone.prototype = {};

_.extend(Drone.prototype, {
    spawn: function(config) {
        Log.info("Drone spawning process of type '" + config.type.title + "'");

        var process = fork(__dirname + "/../" + config.type.name + "/" + config.type.name + ".js");
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
        });
    }
});

var drone = new Drone();