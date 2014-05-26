function CameraComponent() {
    this.ci = mat4.create();
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 45 * Math.PI / 180, window.gr.width / window.gr.height, 0.1, 100.0);
}

CameraComponent.active = null;

CameraComponent.prototype = new ComponentPrototype(CameraComponent);
CameraComponent.prototype.type = "camera";

CameraComponent.prototype.onAttached = function(entity) {
    this.transform = entity.getComponent(TransformComponent);
};

CameraComponent.prototype.onDetached = function() {
    this.transform = null;
};

CameraComponent.prototype.activate = function() {
    CameraComponent.active = this;

    return this;
};

CameraComponent.prototype.update = function() {
    this.transform.update();
    mat4.invert(this.ci, this.transform.matrix);

    return this;
};

CameraComponent.prototype.configure = function(options) {

    return this;
};