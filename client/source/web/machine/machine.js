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

    this.states.push(state);
    var oldTop = this.top;
    this.top = state;
    state.load(this, oldTop);

    return this;
};

StateMachine.prototype.pop = function() {
    if( this.states.length === 0 )
    {
        return;
    }

    this.top = this.states.pop().destroy().under;

    if( this.top )
    {
        this.top.uncover();
    }

    return this;
};

StateMachine.prototype.collapse = function() {
    while(this.states[0] !== this.top)
    {
        this.states.shift().destroy();
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

StateMachine.prototype.update = function(dt) {
    if(dt===0)return;
    
    if( this.top )
    {
        this.top.update(dt);
    }
};