function ModelComponent() {
    this.model = null;
    this.material = null;

    this.visible = true;
}

ModelComponent.prototype = new ComponentPrototype(ModelComponent);

ModelComponent.prototype.onAttached = function() {
    this.entity.model = this;
};

ModelComponent.prototype.onDetached = function() {
    this.entity.model = null;
};