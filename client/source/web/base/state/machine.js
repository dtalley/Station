function StateMachine() {
    this.onStateLoaded = this.onStateLoaded.bind(this);
    this.onStateDestroyed = this.onStateDestroyed.bind(this);

    this.states = [];
    this.remove = [];
    this.top = null;
}

StateMachine.prototype.push = function(state) {
    if( this.top )
    {
        this.top.cover(state);
    }

    var oldTop = this.top;
    this.top = state;
    this.top.load(this, oldTop);

    return this;
};

StateMachine.prototype.pop = function() {
    if( !this.top )
    {
        return;
    }

    this.top = this.top.destroy().under;

    if( this.top )
    {
        this.top.uncover();
    }

    return this;
};

StateMachine.prototype.collapse = function() {
    if(!this.top)return;
    var state = this.top.under;
    while(state)
    {
        var purge = state;
        state = state.under;
        purge.destroy();
    }

    return this;
};

StateMachine.prototype.onStateLoaded = function(state) {
    if( state === this.top )
    {
        this.top.show();
    }
};

StateMachine.prototype.onStateDestroyed = function(state) {

};

StateMachine.prototype.simulate = function() {
    var state = this.top;
    while(state)
    {
        state.simulate();
        state = state.under;
    }
};

StateMachine.prototype.render = function() {
    var state = this.top;
    while(state)
    {
        state.render();
        state = state.under;
    }
};

StateMachine.prototype.handleMessage = function(message) {
    var state = this.top;
    while(state && !state.handleMessage(message))
    {
        state = state.under;
    }

    return !!state;
};

StateMachine.prototype.handleConnect = function(connection) {
    var state = this.top;
    while(state && !state.handleConnect(message))
    {
        state = state.under;
    }

    return !!state;
};