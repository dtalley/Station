function CameraComponent() {
    ComponentPrototype.call(this);

    this.ci = mat4.create();
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 13 * Math.PI / 180, window.gr.width / window.gr.height, 0.1, 1000.0);
    this.revert = mat4.create();
    this.pi = mat4.create();
    mat4.invert(this.pi, this.perspective);
    this.position = vec4.create();
    this.position[3] = 1;

    this.stale = 0xFFFFFF;
}

CameraComponent.active = null;

CameraComponent.prototype = new ComponentPool(CameraComponent);

CameraComponent.prototype.onAttached = function() {
    this.entity.camera = this;
    this.transform = this.entity.getComponent(TransformComponent);
    this.transform.on("update", this.update, this);
    this.transform.watchers++;
    this.update();
};

CameraComponent.prototype.onDetached = function() {
    this.entity.camera = null;
};

CameraComponent.prototype.activate = function() {
    CameraComponent.active = this;
    this.stale = 0xFFFFFF;
    return this;
};

CameraComponent.prototype.update = function() {
    mat4.invert(this.ci, this.entity.transform.matrix);
    mat4.multiply(this.revert, this.entity.transform.matrix, this.pi);
    this.position[0] = this.entity.transform.matrix[12];
    this.position[1] = this.entity.transform.matrix[13];
    this.position[2] = this.entity.transform.matrix[14];
    this.stale = 0xFFFFFF;
    return this;
};

CameraComponent.prototype.isStale = function(channel) {
    if(this.stale & channel)
    {
        this.stale &= ( 0xFFFFFF ^ channel );
        return true;
    }
    return false;
};

CameraComponent.prototype.Channel1 = 1;
CameraComponent.prototype.Channel2 = 1 << 1;
CameraComponent.prototype.Channel3 = 1 << 2;
CameraComponent.prototype.Channel4 = 1 << 3;