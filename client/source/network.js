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

        this.processor = new Processor(messageManager);
        this.processor.onMessage = this.onMessage;
        this.processor.onError = this.onError;
    },

    login: function() {
        this.socket = new WebSocket("ws://localhost:12003");
        this.socket.binaryType = "arraybuffer";
        this.socket.onmessage = this.onData;
    },

    transfer: function() {
        this.authenticated = true;

        this.closeSocket();
        
        this.socket = new WebSocket("ws://localhost:12004");
        this.socket.binaryType = "arraybuffer";
        this.socket.onmessage = this.onData;
    },

    onData: function(event) {
        event.data.imbue();
        manager.processor.process(event.data);
    },

    onMessage: function(message) {
        if( message.id === messageManager.Hello.id )
        {
            if( !manager.authenticated )
            {
                if( message.type === manager.processes.Authentication.id )
                {
                    manager.sendHello();
                    return;
                }
            }
            else if( !manager.connected )
            {
                if( message.type === manager.processes.Gateway.id )
                {
                    manager.sendHello();
                    manager.connected = true;
                    return;
                }
            }

            manager.closeSocket();
        }
        else
        {
            self.postMessage({message: message});
        }
    },

    onError: function(text, error) {
        trace(text + "\n---" + error);
    },

    closeSocket: function() {
        this.socket.onmessage = null;
        this.socket.close();
        this.socket = null;
    },

    sendHello: function() {
        var hello = messageManager.Hello.create();
        hello.type = 0;

        this.send(hello);
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
    if( message.data.message )
    {
        manager.send(message.data.message);
    }
    else if( message.data.type === "start" )
    {
        manager.start(message.data.processes);
    }
    else if( message.data.type === "login" )
    {
        manager.login();
    }
    else if( message.data.type === "transfer" )
    {
        manager.transfer();
    }
}