function CameraComponent() {
    ComponentPrototype.call(this);

    this.ci = mat4.create();
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 13 * Math.PI / 180, window.graphics.width / window.graphics.height, 0.1, 1000.0);
    this.revert = mat4.create();
    this.pi = mat4.create();
    mat4.invert(this.pi, this.perspective);
    this.position = vec4.create();
    this.position[3] = 1;

    this.stale = 0xFFFFFF;
}

CameraComponent.active = null;

CameraComponent.prototype = new ComponentPool(CameraComponent, "camera");

CameraComponent.prototype.onAttached = function() {
    this.entity.camera = this;
    this.entity.on("move", this.onEntityMoved, this);
};

CameraComponent.prototype.onDetached = function() {
    this.entity.camera = null;
    this.entity.off("move", this.onEntityMoved);
};

CameraComponent.prototype.activate = function() {
    CameraComponent.active = this;
    this.stale = 0xFFFFFF;
    return this;
};

CameraComponent.prototype.onEntityMoved = function(matrix) {
    mat4.invert(this.ci, matrix);
    mat4.multiply(this.revert, matrix, this.pi);
    this.position[0] = matrix[12];
    this.position[1] = matrix[13];
    this.position[2] = matrix[14];
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