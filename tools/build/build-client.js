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
var sourcePath = usePath + "source";

module.exports.build = function() {
    emgen();
}

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
        build();
    });
}

function build() {
    console.log("Building client...");
    walk(sourcePath, function(err, files){
        if(err)
        {
            console.log("Could not traverse client source...");
            return;
        }

        files.forEach(function(file){
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

        var distPath = usePath + "dist/" + usePlatform + "/";

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