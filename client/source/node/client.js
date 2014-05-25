function Client() {
    
}

Client.prototype = {
    start: function(readyCallback) {
        readyCallback();
    }
};

exports.client = new Client();