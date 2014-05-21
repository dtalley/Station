process.title = "Authentication";

//Third-party modules
var _ = require("lodash");

//Common modules
var Common = require(__dirname + "/../common/common.js");
var Server = require(__dirname + "/../common/server.js").Server;
var conf = require(__dirname + "/../common/conf.js");

//Set up our configuration
conf.init(__dirname, {
    messageFile: __dirname + "/generated_messages_authentication.js"
});

//Pull out our messages registry
var messages = require(conf.get("messageFile"));

function Authentication() {
    _.bindAll(this);

    this.server = new Server({
        listeners: [
            {
                name: "client",
                port: conf.get("ports:authentication:client"),
                protocol: "websockets"
            }
        ],

        type: Common.ProcessTypes.Authentication
    });

    this.server.emitter.on("connect", this.onConnection);
    this.server.emitter.on("message", this.onMessage);

    this.server.start();
}

Authentication.prototype = {
    
};

_.extend(Authentication.prototype, {
    onConnection: function(listener, connection) {
        connection.claim();

        connection.emitter.on("verify", this.onConnectionVerified);
        connection.emitter.on("reject", this.onConnectionRejected);
        connection.emitter.on("disconnect", this.onConnectionLost);

        if( listener.name === "client" )
        {
            connection.verify();
        }
        else
        {
            connection.verify();
        }
    },

    onConnectionVerified: function(connection) {
        switch(connection.remoteType)
        {
            case Common.ProcessTypes.Client.id:
            {
                var message = messages.LoginRequired.create();
                message.test1 = -46;
                message.test2 = -521;
                message.test3 = -80344;
                message.test5 = 243;
                message.test6 = 51233;
                message.test7 = 101884;
                message.test9 = -1.3344454;
                message.test10 = 8847758475847.11212122221;
                message.test11 = "Test string!";
                message.test12 = true;
                message.test13 = false;
                message.test14 = "true";
                message.test15 = "false";
                message.test16 = 1;
                message.test17 = 0;

                connection.sendMessage(message);
            }
            break;
        }
    },

    onConnectionRejected: function(connection, reason) {

    },

    onConnectionLost: function(connection) {
        
    },

    onMessage: function(message, connection) {
        console.log(message);
        switch(connection.remoteType)
        {
            case Common.ProcessTypes.Client.id:
            {
                switch(message.id)
                {
                    case messages.ClientLogin.id:
                    {
                        console.log("Yay!");
                    }
                    break;
                }
            }
            break;
        }
    }
});

var authentication = new Authentication();