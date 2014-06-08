function ColliderComponent() {
    ComponentPrototype.call(this);

    this.aabb = new Float32Array(6);
    this.aabb[0] = 0;
    this.aabb[1] = 0;
    this.aabb[2] = 0;
    this.aabb[3] = 0;
    this.aabb[4] = 0;
    this.aabb[5] = 0;

    this.type = 0;
    this.flags = 0;

    this.transform = null;
}

ColliderComponent.prototype = new ComponentPool(ColliderComponent);

ColliderComponent.prototype.onAttached = function() {
    this.entity.collider = this;
    this.transform = this.entity.getComponent(TransformComponent);
    this.transform.watcher = this;
    this.update();
};

ColliderComponent.prototype.onDetached = function() {
    this.entity.collider = null;
    this.transform.watcher = null;
    this.transform = null;
};

ColliderComponent.prototype.update = function() {

};

ColliderComponent.prototype.configure = function(options) {
    this.flags = 0;

    if(options.flags) this.flags = options.flags;
    if(options.shape) this.shape = options.shape;
};

ColliderComponent.CollisionShape = function() {

};

ColliderComponent.CollisionShape.prototype.result = new Float32Array(3);

ColliderComponent.Box = function(tlx, tly, tlz, brx, bry, brz) {
    ColliderComponent.CollisionShape.call(this);

    this.tl = new Float32Array(3);
    this.tl[0] = tlx;
    this.tl[1] = tly;
    this.tl[2] = tlz;

    this.br = new Float32Array(3);
    this.br[0] = brx;
    this.br[1] = bry;
    this.br[2] = brz;
};

ColliderComponent.Sphere = function(px, py, pz, vx, vy, vz, span) {
    ColliderComponent.CollisionShape.call(this);

    this.p = vec3.fromValues(px, py, pz);
    this.v = vec3.fromValues(vx, vy, vz);
    this.radius = vec3.length(this.v);
    this.span = span;
};