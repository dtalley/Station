function CameraComponent() {
    this.ci = mat4.create();
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 15 * Math.PI / 180, window.gr.width / window.gr.height, 0.1, 1000.0);

    this.stale = 0xFFFFFF;
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
    this.stale = 0xFFFFFF;
    return this;
};

CameraComponent.prototype.update = function() {
    mat4.invert(this.ci, this.entity.transform.matrix);
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