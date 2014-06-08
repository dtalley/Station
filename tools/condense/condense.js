var path = require("path");

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + path.sep + file;
      fs.stat(file, function(err, stat) {
        if(err) { console.log(err); }
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

var config = require(__dirname + path.sep + "config.json");
var fs = require("fs");
var nl = new Buffer("\n\n");

config.files.forEach(function(info){
    if( info.copy )
    {
        copy(info);
    }
    else
    {
        concatenate(info);
    }
});

function concatenate(info) {
    var writeTo = [];
    var outPath = __dirname + path.sep + ".." + path.sep + "..";
    info.output.forEach(function(file){
        var usePath = outPath;
        var split = file.split("/");
        if( split.length > 1 )
        {
            split.pop();
            while(split.length)
            {
                usePath += path.sep + split.shift();
                try {
                    fs.mkdirSync(usePath);
                }catch(e){if(e.code!='EEXIST')console.log(e);}
            }
        }
        var out = fs.openSync(outPath + path.sep + file, 'w');
        writeTo.push(out);

        console.log("Writing to '" + file + "'.");
    });

    info.input.forEach(function(file, i){
        var handle = fs.openSync(__dirname + path.sep + ".." + path.sep + ".." + path.sep + file, 'r');    
        var read = new Buffer(1024);
        var bytes = 0;
        var iterator = function(out){
            fs.writeSync(out, read, 0, bytes);
        };
        while((bytes = fs.readSync(handle, read, 0, read.length)))
        {
            writeTo.forEach(iterator);
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
}

function copy(info) {
    if( info.output.length !== 1 )
    {
        throw new Error("Copy operations can only have one output.");
    }
        
    var output = info.output[0].replace(/\//g, path.sep);

    if( output.substring(output.length-1, output.length) !== path.sep )
    {
        throw new Error("Copy operation output must be a directory.");
    }

    var outPath = __dirname + path.sep + ".." + path.sep + "..";
    var split = output.split(path.sep);
    var ensurePath = outPath;
    while(split.length)
    {
        ensurePath += path.sep + split.shift();
        try {
            fs.mkdirSync(ensurePath);
        }catch(e){if(e.code!='EEXIST')console.log(e);}
    }

    info.input.forEach(function(file, i){
        file = file.replace(/\//g, path.sep);
        if( file.substr(-2,2) === path.sep + "*" )
        {
            var walkPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + file.substring(0, file.length-2);
            walk(walkPath, function(err, files){
                if(err)
                {
                    console.log("Could not traverse client source...");
                    return;
                }

                files.forEach(function(cfile){
                    var last = cfile.lastIndexOf(walkPath);
                    var name = cfile.substring(last + walkPath.length + 1, cfile.length);
                    var newFile = output + name;
                    var split = name.split(path.sep);
                    if( split.length > 1 )
                    {
                        split.pop();
                        var lastSlash = newFile.lastIndexOf(path.sep);
                        var createPath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + output;
                        while(split.length)
                        {
                            createPath += path.sep + split.shift();
                            try {
                                fs.mkdirSync(createPath);
                                console.log("Created: '" + createPath + "'");
                            }catch(e){if(e.code!='EEXIST')console.log(e);}
                        }
                    }
                    fs.createReadStream(cfile).pipe(fs.createWriteStream(output + name));
                });
            });
        }
        else
        {
            var last = file.lastIndexOf(path.sep);
            var name = file.substring(last, file.length);
            fs.createReadStream(file).pipe(fs.createWriteStream(__dirname + path.sep + ".." + path.sep + ".." + path.sep + output + name));
        }
    });
}