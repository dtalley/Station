DynamicComponent = function() {
    ComponentPrototype.call(this);
};

DynamicComponent.prototype = new ComponentPool(DynamicComponent);

DynamicComponent.prototype.onAttached = function() {
    
};

DynamicComponent.prototype.onDetached = function() {
    
};