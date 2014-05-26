function ModelComponent() {
    this.model = null;
    this.material = null;
    this.transform = null;
}

ModelComponent.prototype = new ComponentPrototype(ModelComponent);
ModelComponent.prototype.type = "model";

ModelComponent.prototype.onAttached = function(entity) {
    this.transform = entity.getComponent(TransformComponent);
};

ModelComponent.prototype.onDetached = function() {
    this.transform = null;
};

ModelComponent.prototype.configure = function(options) {
    if(options.model) this.model = options.model;
    if(options.material) this.material = options.material;

    return this;
};