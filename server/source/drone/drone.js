process.title = "Drone";

var fork = require("child_process").fork;
var _ = require("lodash");
var nconf = require("nconf");
var Connection = require(__dirname + "/../common/connection.js").Connection;
var ServerCommon = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var Log = require(__dirname + "/../common/log.js");

nconf.argv()
     .env()
     .file({ file: __dirname + "/config.json" })
     .file({ file: __dirname + "/../common/config.json" });

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

_.extend(Drone.prototype, {
    spawn: function(config) {
        Log.info("Drone spawning process of type '" + config.type.name + "'");

        var process = fork(__dirname + "/../" + config.type.name + "/" + config.type.name + ".js");
        this.pendingProcesses.push(process);

        var pendingProcesses = this.pendingProcesses;
        var processes = this.processes;
        var spawn = this.spawn;

        var connected = false;

        process.on("message", function(message){
            if( message.type == "connected" )
            {
                pendingProcesses.splice(pendingProcesses.indexOf(process), 1);
                processes.push(process);

                if( config.type == ServerCommon.ProcessTypes.Master )
                {
                    Log.info("Drone successfully spawned Master.");
                }

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