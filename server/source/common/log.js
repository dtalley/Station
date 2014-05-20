//Third-party node modules
var winston = require("winston");

var Log = function(){}

Log.prototype = {};

Log.prototype.trace = function(text) {
    console.log("(" + process.title + "): " +text);
};

Log.prototype.info = function(text) {
    winston.info("(" + process.title + "): " +text);
}

Log.prototype.warn = function(text) {
    winston.warn("(" + process.title + "): " +text);
}

Log.prototype.error = function(text) {
    winston.error("(" + process.title + "): " +text);
}

module.exports.Log = new Log();