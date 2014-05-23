function GameState() {

}

GameState.prototype = new StatePrototype();

GameState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
    this.holder.appendChild(document.createTextNode("Game..."));
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
                console.log("LoginState::handleMessage() Unhandled message...");
                console.log(message);
            }
    }
}

GameState.prototype.handleConnect = function(type) {
    
}