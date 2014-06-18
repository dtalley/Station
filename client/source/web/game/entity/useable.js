function UseableComponent() {
    ComponentPrototype.call(this);
}

UseableComponent.prototype = new ComponentPool(UseableComponent, "usable");

UseableComponent.prototype.onAttached = function() {

};

UseableComponent.prototype.onDettached = function() {

};