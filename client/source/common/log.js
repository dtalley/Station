function Log() {}

Log.prototype = {};

Log.prototype.trace = function(text) {
    console.log(text);
}

Log.prototype.info = function(text) {
    console.log(text);
}

Log.prototype.warn = function(text) {
    console.log(text);
}

Log.prototype.error = function(text) {
    console.log(text);
}

module.exports.Log = new Log();