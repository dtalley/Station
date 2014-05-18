var winston = require("winston");

module.exports.trace = function(text) {
    console.log(text);
};

module.exports.info = function(text) {
    winston.info(text);
}

module.exports.warn = function(text) {
    winston.warn(text);
}

module.exports.error = function(text) {
    winston.error(text);
}