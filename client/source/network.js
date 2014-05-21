importScripts("generated/generated_messages_client.js");
importScripts("generated/generated_processor.js");

function trace(text) {
    self.postMessage({trace:text});
}

function NetworkManager() {
    this.packInfo = {};

    this.authenticated = false;
    this.connected = false;
}

NetworkManager.prototype = {
    start: function(processes) {
        this.processes = processes;

        this.socket = new WebSocket("ws://localhost:12003");
        this.socket.binaryType = "arraybuffer";

        this.socket.onmessage = this.onData;

        this.processor = new Processor(messageManager);
        this.processor.onMessage = this.onMessage;
        this.processor.onError = this.onError;
    },

    onData: function(event) {
        manager.processor.process(event.data);
    },

    onMessage: function(message) {
        if( message.id === messageManager.Hello.id )
        {
            if( !this.authenticated )
            {
                if( message.type === manager.processes.Authentication.id )
                {
                    var hello = messageManager.Hello.create();
                    hello.type = 0;

                    manager.send(hello);
                }
                else
                {
                    this.socket.terminate();
                }
            }
            else if( !this.connected )
            {
                if( message.type === manager.processes.Gateway.id )
                {
                    var hello = messageManager.Hello.create();
                    hello.type = 0;

                    manager.send(hello);
                }
                else
                {
                    this.socket.terminate();
                }
            }
        }
        else
        {
            self.postMessage({
                message: message
            });
        }
    },

    onError: function(text, error) {
        self.postMessage({
            trace: text
        });

        self.postMessage({
            trace: "" + error
        });
    },

    send: function(message) {
        var buffer = messageManager.index[message.id].pack(message, null, null, this.packInfo);
        var newBuffer = buffer.slice(0, this.packInfo.size);
        messageManager.returnBuffer(buffer);
        this.socket.send(newBuffer);
    }
};

var manager = new NetworkManager();

self.onmessage = function(message) {
    if( message.data.type === "start" )
    {
        manager.start(message.data.processes);
    }
    else if( message.data.type === "send" )
    {
        manager.send(message.data.message);
    }
}