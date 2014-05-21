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
        console.log(message);
        if( message.id = messages.LoginRequired.id )
        {
            var login = messages.ClientLogin.create();
            login.test1 = -46;
            login.test2 = -521;
            login.test3 = -80344;
            login.test5 = 243;
            login.test6 = 51233;
            login.test7 = 101884;
            login.test9 = -1.3344454;
            login.test10 = 8847758475847.11212122221;
            login.test11 = "Test string!";
            login.test12 = true;
            login.test13 = false;
            login.test14 = "true";
            login.test15 = "false";
            login.test16 = 1;
            login.test17 = 0;

            this.network.postMessage({type:"send", message:login});
        }
    }
};

exports.client = new Client();