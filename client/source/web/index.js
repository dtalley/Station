Orionark.Application = function() {
    this.onNetworkMessage = this.onNetworkMessage.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMachineLoaded = this.onMachineLoaded.bind(this);

    if( process )
    {
        process.mainModule.exports.client.start(this.onClientReady);
    }
    else
    {
        this.onClientReady();
    }
};

Orionark.Application.prototype = {
    onClientReady: function() {
        this.network = new window.Worker("network.js");
        this.network.addEventListener("message", this.onNetworkMessage, false);

        this.loadScript("machine.js", this.onMachineLoaded);
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
        else if( message.data.connect )
        {
            this.handleConnect(message.data.connect);
        }
    },

    handleMessage: function(message) {
        if( this.machine && this.machine.top )
        {
            this.machine.top.handleMessage(message);
        }
        else
        {
            console.log("Application::handleMessage() Unhandled message...");
            console.log(message);
        }
    },

    handleConnect: function(type) {
        if( this.machine && this.machine.top )
        {
            this.machine.top.handleConnect(type);
        }
        else
        {
            console.log("Unhandled connection '" + type + "'");
        }
    },

    loadScript: function(script, callback) {
        var head = document.getElementsByTagName('head')[0];
        var element = document.createElement('script');
        element.type = 'text/javascript';
        element.src = script;
        element.onreadystatechange = callback;
        element.onload = callback;
        head.appendChild(element);
    },

    onMachineLoaded: function() {
        this.machine = new StateMachine();
        this.machine.push(new LoginState());
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    window.app = new Orionark.Application();
});