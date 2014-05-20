var config = require("./config.json");
var fs = require("fs");

var generation = {};
for( var key in config.projects ) 
{
    var project = config.projects[key];
    var file = __dirname + "/../../" + project.path + "/generated_common_" + key + ".js";
    
    var file = fs.openSync(file, 'w');

    project.file = file;
    project.name = key;
}

function write(project, text) {
    var buffer = new Buffer(text);
    fs.writeSync(config.projects[project].file, buffer, 0, buffer.length);
}

var storedMessages = {};
var forcedId = -1;
var id = 0;

config.files.forEach(function(file, i){
    var file = fs.openSync(__dirname + "/../../" + file, 'r');    
    var read = new Buffer(1024);
    var bytes = 0;
    while(bytes = fs.readSync(file, read, 0, read.length))
    {
        for( var key in config.projects )
        {
            var project = config.projects[key];
            fs.writeSync(project.file, read, 0, bytes);
        }
    }
    fs.closeSync(file);
});

for( var key in config.projects ) 
{
    var project = config.projects[key];

    fs.closeSync(project.file);

    console.log("Successfully condensed common files for '" + project.name + "'.");
}