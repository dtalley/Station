DynamicComponent = function() {
    ComponentPrototype.call(this);

    this.actor = null;
    this.deployable = null;
};

DynamicComponent.prototype = new ComponentPool(DynamicComponent, "dynamic");

DynamicComponent.prototype.onAttached = function() {
    this.actor = this.entity.getComponent(ActorComponent);
    this.deployable = this.entity.getComponent(DeployableComponent);
};

DynamicComponent.prototype.onDetached = function() {
    
};