DynamicComponent = function() {
    ComponentPrototype.call(this);

    this.player = false;
    this.using = false;

    this.movement = new Float32Array(2);
    this.movement[0] = 0;
    this.movement[1] = 0;

    this.holding = null;
    this.targeting = null;
};

DynamicComponent.prototype = new ComponentPool(DynamicComponent);

DynamicComponent.prototype.onAttached = function() {
    
};

DynamicComponent.prototype.onDetached = function() {
    
};