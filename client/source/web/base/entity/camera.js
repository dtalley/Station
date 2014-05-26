function CameraComponent() {
    this.ci = mat4.create();
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 15 * Math.PI / 180, window.gr.width / window.gr.height, 0.1, 1000.0);
}

CameraComponent.active = null;

CameraComponent.prototype = new ComponentPrototype(CameraComponent);

CameraComponent.prototype.onAttached = function() {
    this.entity.camera = this;
};

CameraComponent.prototype.onDetached = function() {
    this.entity.camera = null;
};

CameraComponent.prototype.activate = function() {
    CameraComponent.active = this;

    return this;
};

CameraComponent.prototype.update = function() {
    mat4.invert(this.ci, this.entity.transform.matrix);
    return this;
};