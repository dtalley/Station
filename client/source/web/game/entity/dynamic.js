DynamicComponent = function() {
    ComponentPrototype.call(this);

    this.actor = null;
    this.deployable = null;
    this.container = null;
};

DynamicComponent.prototype = new ComponentPool(DynamicComponent, "dynamic");

DynamicComponent.prototype.onAttached = function() {
    this.actor = this.entity.getComponent(ActorComponent);
    this.deployable = this.entity.getComponent(DeployableComponent);
    this.container = this.entity.getComponent(ContainerComponent);
};

DynamicComponent.prototype.onDetached = function() {
    this.actor = null;
    this.deployable = null;
    this.container = null;
};