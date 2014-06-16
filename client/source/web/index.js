//console.time = function(){};
//console.timeEnd = function(){};

Orionark.Application = function() {
    this.onNetworkMessage = this.onNetworkMessage.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onBaseLoaded = this.onBaseLoaded.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);

    this.start = this.start.bind(this);
    this.finish = this.finish.bind(this);
    this.update = this.update.bind(this);

    this.time = 0;
    this.now = 0;
    this.dt = 0;
    this.step = 1000.0 / 60.0;
    this.accumulator = 0.0;

    this.draw = false;

    var process = process || null;
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
        //this.network = new window.Worker("network.js");
        //this.network.addEventListener("message", this.onNetworkMessage, false);

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

        var scriptProgress = function(event) {
            if(event.lengthComputable && progressCallback) progressCallback(event.loaded, event.total);
        };
        if( progressCallback )
        {
            req.addEventListener("progress", scriptProgress, false);
        }

        var scriptLoaded = function(event) {
            req.removeEventListener("progress", scriptProgress);
            req.removeEventListener("load", scriptLoaded);
            req.removeEventListener("error", error);

            if(event)
            {
                window.eval(event.target.responseText);
            }

            completeCallback();
        };
        req.addEventListener("load", scriptLoaded, false);

        var error = function(event) {
            console.log("Script Load Failure", script, event);

            scriptLoaded();
        };
        req.addEventListener("error", error, false);

        req.open("GET", script, true);
        req.send();
    },

    onBaseLoaded: function() {
        window.gr = new GraphicsManager(this.finish);
        window.asset = new AssetManager();
        window.ui = document.getElementById("ui");
        window.em = new EntityManager();

        document.documentElement.webkitRequestFullScreen();
        document.documentElement.webkitRequestPointerLock();

        this.machine = new StateMachine();
        this.machine.push(new GameState());

        window.addEventListener("resize", this.onWindowResized, false);
        this.onWindowResized();

        this.time = performance.now();
        //this.finish();
        this.timer = setTimeout(this.update, 0);
        window.requestAnimationFrame(this.start);
    },

    update: function() {
        //console.timeEnd("onk_finish");
        //console.time("onk_start");

        if(this.draw)
        {
            this.render();
        }

        clearTimeout(this.timer);

        var now = performance.now();
        this.dt = now - this.time;
        this.time = now;

        var count = 0;
        
        //console.time("onk_simulate");
        this.accumulator += this.dt;
        while(this.accumulator >= this.step)
        {
            this.machine.simulate();
            this.accumulator -= this.step;
            count++;
        }
        //console.timeEnd("onk_simulate");

        this.timer = setTimeout(this.update, 0);
    },

    start: function(time) {
        this.draw = true;
    },

    render: function() {
        window.gr.startFrame();
        //console.time("onk_gather");
        this.machine.render();
        //console.timeEnd("onk_gather");
        window.gr.endFrame();
    },

    finish: function() {
        //console.timeEnd("onk_start");
        //console.time("onk_finish");
        
        window.requestAnimationFrame(this.start);
        //this.start();
    },

    onWindowResized: function() {
        window.gr.resize(window.innerWidth, window.innerHeight);
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    window.app = new Orionark.Application();
});