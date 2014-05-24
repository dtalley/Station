function GameState() {

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

    this.fragment.appendChild(this.holder);

    this.machine.onStateLoaded(this);
};

GameState.prototype.show = function() {
    document.body.appendChild(this.fragment);

    this.machine.collapse();
};

GameState.prototype.subDestroy = function() {
    document.body.removeChild(this.holder);
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
}

GameState.prototype.handleConnect = function(type) {
    
}