var processTypes = {
    Client: 0,
    Gateway: 3,
    Authentication: 4
};

function trace(text) {
    self.postMessage({trace:text});
}

function NetworkManager() {
    this.packInfo = {};

    this.authenticated = false;
    this.connected = false;

    this.processor = new Processor(messageManager);
    this.processor.onMessage = this.onMessage;
    this.processor.onError = this.onError;
}

NetworkManager.prototype = {
    login: function() {
        this.socket = new WebSocket("ws://localhost:12003");
        this.socket.binaryType = "arraybuffer";
        this.socket.onmessage = this.onData;
    },

    transfer: function() {
        if( this.authenticated )
        {
            throw new Error("Received transfer request when already authenticated and transferred.");
            return;
        }

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
                if( message.type === processTypes.Authentication )
                {
                    manager.sendHello();
                    return;
                }
            }
            else if( !manager.connected )
            {
                if( message.type === processTypes.Gateway )
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
        hello.type = processTypes.Client;

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
    else if( message.data.start )
    {
        manager.start(message.data.processes);
    }
    else if( message.data.login )
    {
        manager.login();
    }
    else if( message.data.transfer )
    {
        manager.transfer();
    }
}