function ModelComponent() {
    this.model = null;
    this.material = null;
    this.transform = null;
}

ModelComponent.prototype = new ComponentPrototype(ModelComponent);

ModelComponent.prototype.onAttached = function() {
    this.entity.model = this;
};

ModelComponent.prototype.onDetached = function() {
    this.entity.model = null;
};