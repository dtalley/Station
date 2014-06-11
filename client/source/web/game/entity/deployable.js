DeployableComponent = function() {
    ComponentPrototype.call(this);
};

DeployableComponent.prototype = new ComponentPool(DeployableComponent, "deployable");

DeployableComponent.prototype.onAttached = function() {
    
};

DeployableComponent.prototype.onDetached = function() {
    
};