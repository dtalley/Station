//Third-party node modules
var winston = require("winston");

var Log = function(){}

Log.prototype = {};

Log.trace = Log.prototype.trace = function(text) {
    console.log("(" + process.title + "): " +text);
};

Log.info = Log.prototype.info = function(text) {
    winston.info("(" + process.title + "): " +text);
}

Log.warn = Log.prototype.warn = function(text) {
    winston.warn("(" + process.title + "): " +text);
}

Log.error = Log.prototype.error = function(text) {
    winston.error("(" + process.title + "): " +text);
}

module.exports.Log = new Log();

