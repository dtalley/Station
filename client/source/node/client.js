//Third-party modules
var _ = require("lodash");

function Client() {
    
}

Client.prototype = {
    start: function(readyCallback) {
        readyCallback();
    }
};

exports.client = new Client();