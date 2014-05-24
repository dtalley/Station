Orionark.Application = function() {
    this.onNetworkMessage = this.onNetworkMessage.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMachineLoaded = this.onMachineLoaded.bind(this);
    this.onWindowUpdate = this.onWindowUpdate.bind(this);

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
            console.log("Unhandled Message", message);
        }
    },

    handleConnect: function(type) {
        if( this.machine && this.machine.top )
        {
            this.machine.top.handleConnect(type);
        }
        else
        {
            console.log("Unhandled Connection", type);
        }
    },

    loadScript: function(script, completeCallback, progressCallback) {
        var req = new XMLHttpRequest();

        if( progressCallback )
        {
            var scriptProgress = function(event) {
                if(event.lengthComputable) progressCallback(event.loaded, event.total);
            };
            req.addEventListener("progress", scriptProgress, false);
        }

        var scriptLoaded = function(event) {
            req.removeEventListener("progress", scriptProgress);
            req.removeEventListener("load", scriptLoaded);
            req.removeEventListener("error", error);

            if(event) window.eval(event.target.responseText);

            completeCallback();
        };
        req.addEventListener("load", scriptLoaded, false);

        var error = function(event) {
            console.log("Script Load Failure", script, event);

            scriptLoaded();
        };
        req.addEventListener("error", error, false);

        req.open("GET", script);
        req.send();
    },

    onMachineLoaded: function() {
        this.machine = new StateMachine();
        this.machine.push(new GameState());

        window.addEventListener("message", this.onWindowUpdate);
        window.postMessage(performance.now(), "*");
    },

    onWindowUpdate: function(then) {
        var now = performance.now();
        this.machine.update(now-then.data);
        window.postMessage(now, "*");
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    window.app = new Orionark.Application();
});