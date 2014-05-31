var fs = require('fs');
var path = require('path');
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

var exec = require("child_process").exec;
var zip = new require('node-zip')();
var usePath = __dirname + path.sep + ".." + path.sep + ".." + path.sep + "client" + path.sep;
var sourcePath = usePath + "source/node";

var extra = "";

module.exports.build = function(extra) {
    extra = extra;
    emgen();
};

function emgen() {
    exec("emgen", function(err, stdout, stderr){
        if(err)
        {
            console.log(stderr);
            return;
        }

        console.log(stdout);
        condense();
    });
}

function condense() {
    exec("condense", function(err, stdout, stderr){
        if(err)
        {
            console.log(stderr);
            return;
        }

        console.log(stdout);
        if( extra === "atom" )
        {
            build_atom();
        }
        else
        {
            build_nw();
        }
    });
}

function build_atom() {
    return;
    console.log("Building node-webkit client...");
    walk(sourcePath, function(err, files){
        if(err)
        {
            console.log("Could not traverse client source...");
            return;
        }

        var usePlatform = "test";
        if( process.platform === "win32" )
        {
            usePlatform = "win32";
        }

        var distPath = usePath + "dist/" + usePlatform + "-atom/";
        try{fs.mkdirSync(distPath);}catch(e){}
        try{fs.mkdirSync(distPath + "resources/");}catch(e){}
        try{fs.mkdirSync(distPath + "resources/app/");}catch(e){}

        files.forEach(function(file){
            if( file.substr(-9, 9) === "gitignore" )
            {
                return;
            }
            
            var data = fs.readFileSync(file);

            file = file.replace(sourcePath + path.sep, "");
            if( path.sep === "\\" )
            {
                file = file.replace(/\\/g, "/");
            }
            else
            {
                file = file.replace(/\//g, "/");
            }
            
            var ab = new ArrayBuffer(data.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < data.length; ++i) {
                view[i] = data[i];
            }

            fs.createReadStream(file).pipe(fs.createWriteStream(distPath + file));
        });

        if( process.platform === "win32" )
        {
            /*var atomFiles = [
                "nw.exe",
                "nw.pak",
                "icudt.dll",
                "ffmpegsumo.dll",
                "libEGL.dll",
                "libGLESv2.dll"
            ];

            atomFiles.forEach(function(file){
                fs.createReadStream(usePath + "atom-shell/" + usePlatform + "/" + file).pipe(fs.createWriteStream(distPath + file));
            });*/
        }

        console.log("Client built.");
    });
}

function build_nw() {
    return;
    console.log("Building node-webkit client...");
    walk(sourcePath, function(err, files){
        if(err)
        {
            console.log("Could not traverse client source...");
            return;
        }

        files.forEach(function(file){
            if( file.substr(-9, 9) === "gitignore" )
            {
                return;
            }
            
            var data = fs.readFileSync(file);

            file = file.replace(sourcePath + path.sep, "");
            if( path.sep === "\\" )
            {
                file = file.replace(/\\/g, "/");
            }
            else
            {
                file = file.replace(/\//g, "/");
            }
            
            var ab = new ArrayBuffer(data.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < data.length; ++i) {
                view[i] = data[i];
            }

            zip.file(file, ab, {binary:true});
        });

        var usePlatform = "test";
        if( process.platform === "win32" )
        {
            usePlatform = "win32";
        }

        var distPath = usePath + "dist/" + usePlatform + "-nw/";

        try{fs.mkdirSync(usePath + "dist/" + usePlatform);}catch(e){}

        var data = zip.generate({base64:false,compression:'DEFLATE'});
        fs.writeFileSync(distPath + "client.nw", data, 'binary');

        if( process.platform === "win32" )
        {
            var nwFiles = [
                "nw.exe",
                "nw.pak",
                "icudt.dll",
                "ffmpegsumo.dll",
                "libEGL.dll",
                "libGLESv2.dll"
            ];

            nwFiles.forEach(function(file){
                fs.createReadStream(usePath + "nw/" + usePlatform + "/" + file).pipe(fs.createWriteStream(distPath + file));
            });
        }

        console.log("Client built.");
    });
}