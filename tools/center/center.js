process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\condense";
process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\emgen";

var spawn = require("child_process").spawn;
spawn("cmd", ["/Q"], { stdio: 'inherit' });