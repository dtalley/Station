function ColliderComponent() {
    ComponentPrototype.call(this);

    this.aabb = new aabb();

    this.type = 0;
    this.flags = 0;

    this.transform = null;
}

ColliderComponent.prototype = new ComponentPool(ColliderComponent);

ColliderComponent.prototype.onAttached = function() {
    this.entity.collider = this;
    this.transform = this.entity.getComponent(TransformComponent);
    this.transform.on("update", this.update, this);
    this.transform.watchers++;
};

ColliderComponent.prototype.onDetached = function() {
    this.entity.collider = null;
    this.transform.watcher = null;
    this.transform.watchers--;
    this.transform = null;
};

ColliderComponent.prototype.update = function() {
    this.shape.calculateAABB(this.aabb, this.transform.matrix);
};

ColliderComponent.prototype.configure = function(options) {
    this.flags = 0;

    if(options.flags) this.flags = options.flags;
    if(options.shape) this.shape = options.shape;

    this.update();

    return this;
};

ColliderComponent.CollisionShape = function() {
    this.c = new Float32Array(3); //OBB Center
    this.e = new Float32Array(3); //OBB Extents
};

ColliderComponent.CollisionShape.prototype.result = new Float32Array(16);
ColliderComponent.CollisionShape.prototype.calculateAABB = function(aabb, transform) {
    var c = aabb.c, e = aabb.e;
    vec3.transformMat4(c, this.c, transform);
    mat4.abs(this.result, transform);
    vec3.transformNormalMat4(e, this.e, this.result);
};

ColliderComponent.Box = function(cx, cy, cz, ex, ey, ez) {
    ColliderComponent.CollisionShape.call(this);

    var c = this.c, e = this.e;

    c[0] = cx;
    c[1] = cy;
    c[2] = cz;

    e[0] = ex;
    e[1] = ey;
    e[2] = ez;
};

ColliderComponent.Box.prototype = new ColliderComponent.CollisionShape();

ColliderComponent.Sphere = function(px, py, pz, vx, vy, vz, span) {
    ColliderComponent.CollisionShape.call(this);

    this.v = vec3.fromValues(vx, vy, vz);
    this.r = vec3.length(this.v);
    this.s = span;

    var c = this.c, e = this.e;
    var r = this.r;

    c[0] = px; c[1] = py; c[2] = pz;
    e[0] = r; e[1] = r; e[2] = r;
};

ColliderComponent.Sphere.prototype = new ColliderComponent.CollisionShape();