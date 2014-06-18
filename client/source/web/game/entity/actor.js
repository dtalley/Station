function ActorComponentShared() {}

ActorComponentShared.prototype = new ComponentPool(ActorComponent, "actor");

function ActorComponent() {
    ComponentPrototype.call(this);

    this.player = false;
    this.using = false;

    this.holding = null;
    this.targeting = null;
    this.container = null;

    this.moveSpeed = window.app.step * 0.005;
}

ActorComponent.prototype = new ActorComponentShared();

ActorComponent.prototype.onAttached = function() {

};

ActorComponent.prototype.onDetached = function() {
    
};

ActorComponent.prototype.configure = function(options) {
    if(!options) options = {};

    this.player = !!options.player;
    this.broadphase = options.broadphase;
    this.emitter = options.emitter;

    return this;
};