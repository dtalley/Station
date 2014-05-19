var winston = require("winston");

module.exports.trace = function(text) {
    console.log("(" + process.title + "): " +text);
};

module.exports.info = function(text) {
    winston.info("(" + process.title + "): " +text);
}

module.exports.warn = function(text) {
    winston.warn("(" + process.title + "): " +text);
}

module.exports.error = function(text) {
    winston.error("(" + process.title + "): " +text);
}