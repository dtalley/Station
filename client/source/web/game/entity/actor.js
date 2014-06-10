ActorComponent = function() {
    ComponentPrototype.call(this);

    this.player = false;
    this.using = false;

    this.movement = new Float32Array(2);
    this.movement[0] = 0;
    this.movement[1] = 0;

    this.holding = null;
    this.targeting = null;
};

ActorComponent.prototype = new ComponentPool(ActorComponent);

ActorComponent.prototype.onAttached = function() {
    
};

ActorComponent.prototype.onDetached = function() {
    
};