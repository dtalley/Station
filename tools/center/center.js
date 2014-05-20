process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\condense";
process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\emgen";
process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\build";

process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\..\\client\\scripts";
process.env["PATH"] = process.env["PATH"] + ";" + __dirname + "\\..\\..\\server\\scripts";

var spawn = require("child_process").spawn;
spawn("cmd", ["/Q"], { stdio: 'inherit' });