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