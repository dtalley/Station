Orionark.Application = function() {
    this.onNetworkMessage = this.onNetworkMessage.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onBaseLoaded = this.onBaseLoaded.bind(this);
    this.onWindowUpdate = this.onWindowUpdate.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);

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

        this.loadScript("base.js", this.onBaseLoaded);
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
        if( !this.machine || !this.machine.handleMessage(message) )
        {
            console.log("Unhandled Message", message);
        }
    },

    handleConnect: function(type) {
        if( !this.machine || !this.machine.handleConnect(type) )
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

    onBaseLoaded: function() {
        window.gr = new GraphicsManager();
        window.ui = document.getElementById("ui");

        this.machine = new StateMachine();
        this.machine.push(new GameState());

        window.addEventListener("message", this.onWindowUpdate);
        window.postMessage(performance.now(), "*");

        window.addEventListener("resize", this.onWindowResized);
        this.onWindowResized();
    },

    onWindowUpdate: function(then) {
        var now = performance.now();
        window.gr.startFrame();
        this.machine.update(now-then.data);
        window.gr.endFrame();
        setTimeout(function(){
            window.postMessage(now, "*");
        },0);
    },

    onWindowResized: function() {
        window.gr.resize(window.innerWidth, window.innerHeight);
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    window.app = new Orionark.Application();
});