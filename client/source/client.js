//Node modules
var net = require("net");

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/common/common.js");
var Log = require(__dirname + "/common/log.js").Log;

//Generated common modules
var messages = require(__dirname + "/generated/generated_messages_client_index.js");

function Client() {
    _.bindAll(this);
}

Client.prototype = {
    start: function() {
        Log.trace("Starting client...");

        this.network = new window.Worker("network.js");
        this.network.addEventListener("message", this.onNetworkMessage, false);
        
        this.network.postMessage({
            type: "start",
            processes: Common.ProcessTypes
        });

        this.network.postMessage({
            type: "login",
            processes: Common.ProcessTypes
        });
    },

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
        switch(message.id)
        {
            case messages.LoginRequired.id:
            {
                var login = messages.ClientLogin.create();
                this.network.postMessage({message:login});
            }
            break;

            case messages.LoginTicket.id:
            {
                this.network.postMessage({
                    type: "transfer"
                });
            }
            break;

            default:
                console.log(message);
        }
    }
};

exports.client = new Client();