function StatePrototype() {
    this.over = null;
    this.under = null;
    this.machine = null;
}

StatePrototype.prototype.load = function(machine, state) {
    this.under = state;
    this.machine = machine;
    this.subLoad();
    return this;
};
StatePrototype.prototype.subLoad = function(){};

StatePrototype.prototype.cover = function(machine, state) {
    this.over = state;
    this.subCover();
    return this;
};
StatePrototype.prototype.subCover = function(){};

StatePrototype.prototype.uncover = function(machine, state) {
    this.over = null;
    this.subUncover();
    return this;
};
StatePrototype.prototype.subUncover = function(){};

StatePrototype.prototype.destroy = function(machine, state) {
    this.over = null;
    this.under = null;
    this.subDestroy();
    return this;
};
StatePrototype.prototype.subDestroy = function(){};

StatePrototype.prototype.show = function(){};

StatePrototype.prototype.handleMessage = function(message){
    if( this.under )
    {
        this.under.handleMessage(message);
    }
};

StatePrototype.prototype.handleConnect = function(type){
    if( this.under )
    {
        this.under.handleConnect(type);
    }
};

StatePrototype.prototype.internalMessage = function(message, state){
    this.handleInternalMessage(message);

    if( message.stop )
    {
        return;
    }

    if( this.under )
    {
        this.under.internalMessage(message, this);
    }
};
StatePrototype.prototype.handleInternalMessage = function(message){};

StatePrototype.prototype.update = function(dt){
    if( this.under )
    {
        this.under.update(dt);
    }
};