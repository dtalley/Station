var config = require("./config.json");
var fs = require("fs");

config.files.forEach(function(info){
    var writeTo = [];

    info.output.forEach(function(file){
        var out = fs.openSync(__dirname + "/../../" + file, 'w');
        writeTo.push(out);

        console.log("Writing to '" + file + "'.");
    });

    info.input.forEach(function(file){
        var handle = fs.openSync(__dirname + "/../../" + file, 'r');    
        var read = new Buffer(1024);
        var bytes = 0;
        while(bytes = fs.readSync(handle, read, 0, read.length))
        {
            writeTo.forEach(function(out){
                fs.writeSync(out, read, 0, bytes);
            });
        }
        fs.closeSync(handle);
    });

    writeTo.forEach(function(out){
        fs.closeSync(out);
    });
});