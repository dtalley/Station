if( process.argv.length < 3 )
{
    console.log("Options: client, server");
}
else
{
    var type = process.argv[2];
    console.log("Build '" + type + "'");

    var fs = require("fs");
    if( !fs.existsSync(__dirname + "/build-" + type + ".js") )
    {
        console.log("No build script for '" + type + "'");
    }
    else
    {
        var handler = require(__dirname + "/build-" + type + ".js");
        handler.build(process.argv[3]);
    }
}