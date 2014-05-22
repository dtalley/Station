var config = require("./config.json");
var fs = require("fs");
var nl = new Buffer("\n\n");

config.files.forEach(function(info){
    var writeTo = [];

    info.output.forEach(function(file){
        var out = fs.openSync(__dirname + "/../../" + file, 'w');
        writeTo.push(out);

        console.log("Writing to '" + file + "'.");
    });

    info.input.forEach(function(file, i){
        var handle = fs.openSync(__dirname + "/../../" + file, 'r');    
        var read = new Buffer(1024);
        var bytes = 0;
        while(bytes = fs.readSync(handle, read, 0, read.length))
        {
            writeTo.forEach(function(out){
                fs.writeSync(out, read, 0, bytes);
            });
        }

        if( i < info.input.length -1 )
        {
            writeTo.forEach(function(out){
                fs.writeSync(out, nl, 0, nl.length);
            });
        }
        
        fs.closeSync(handle);
    });

    writeTo.forEach(function(out){
        fs.closeSync(out);
    });
});