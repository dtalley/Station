function GameState() {
    this.onGameLoaded = this.onGameLoaded.bind(this);
    this.onGameProgress = this.onGameProgress.bind(this);

    this.visible = false;
}

GameState.prototype = new StatePrototype();

GameState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
    this.holder.id = "game";
    
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("width", "100%");
    this.canvas.setAttribute("height", "100%");
    this.holder.appendChild(this.canvas);

    this.fps = document.createElement("div");
    this.fps.classList.add("fps");
    this.holder.appendChild(this.fps);

    this.fpsTotal = 0;
    this.fpsList = [];
    this.fpsCount = 0;

    this.fragment.appendChild(this.holder);

    window.app.loadScript("game.js", this.onGameLoaded, this.onGameProgress);
};

GameState.prototype.onGameLoaded = function() {
    this.machine.onStateLoaded(this);
};

GameState.prototype.onGameProgress = function(loaded, total) {

};

GameState.prototype.show = function() {
    this.visible = true;

    document.body.appendChild(this.fragment);

    this.machine.collapse();
};

GameState.prototype.subDestroy = function() {
    document.body.removeChild(this.holder);
};

GameState.prototype.update = function(dt) {
    if( this.visible )
    {
        if( this.fpsList.length > 10 )
        {
            this.fpsTotal -= this.fpsList.shift();
            this.fpsCount--;
        }
        this.fpsList.push(dt);
        this.fpsTotal += dt;
        this.fpsCount++;

        var fps = 1000.0 / ( this.fpsTotal / this.fpsCount );
        this.fps.innerHTML = fps.toFixed(1) + "";
    }

    if( this.under ) this.under.update(dt);
};

GameState.prototype.handleMessage = function(message) {
    switch(message.id)
    {
        default:
            if( this.under )
            {
                this.under.handleMessage(message);
            }
            else
            {
                console.log("Unhandled Message", message);
            }
    }
};

GameState.prototype.handleConnect = function(type) {
    
};