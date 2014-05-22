Orionark.Application = function() {
    this.onNetworkMessage = this.onNetworkMessage.bind(this);

    this.network = new window.Worker("network.js");
    this.network.addEventListener("message", this.onNetworkMessage, false);
    
    this.network.postMessage({start:1});
};

Orionark.Application.prototype = {
    onNetworkMessage: function(message) {
        if( message.data.trace )
        {
            console.log(message.data.trace);
        }
        else if( message.data.message )
        {
            this.handleMessage(message.data.message);
        }
    },

    handleMessage: function(message) {
        console.log(message);
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    window.app = new Orionark.Application();
});