function ModelComponent() {
    ComponentPrototype.call(this);
    
    this.model = null;
    this.material = null;

    this.visible = true;
}

ModelComponent.prototype = new ComponentPool(ModelComponent, "model");

ModelComponent.prototype.onAttached = function() {
    this.entity.model = this;
};

ModelComponent.prototype.onDetached = function() {
    this.entity.model = null;
};