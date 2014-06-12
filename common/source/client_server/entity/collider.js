function ColliderComponent() {
    ComponentPrototype.call(this);

    this.aabb = new aabb();

    this.type = 0;
    this.flags = 0;

    this.transform = null;
    this.container = null; //Broadphase container
}

ColliderComponent.prototype = new ComponentPool(ColliderComponent, "collider");

ColliderComponent.prototype.onAttached = function() {
    this.entity.collider = this;
    this.transform = this.entity.getComponent(TransformComponent);
    this.transform.on("update", this.update, this);
    this.transform.watchers++;
};

ColliderComponent.prototype.onDetached = function() {
    this.entity.collider = null;
    this.transform.off("update", this.update);
    this.transform.watchers--;
    this.transform = null;
    
    if(this.node && this.broadphase)
    {
        this.broadphase.remove(this);
    }
};

ColliderComponent.prototype.update = function() {
    this.shape.calculateAABB(this.aabb, this.transform.matrix);

    if(!this.node && this.broadphase)
    {
        this.broadphase.insert(this);
    }
};

ColliderComponent.prototype.configure = function(options) {
    this.flags = 0;
    this.broadphase = null;

    if(options.flags) this.flags = options.flags;
    if(options.shape) this.shape = options.shape;

    if(options.broadphase) this.broadphase = options.broadphase;

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

    c[0] = px; 
    c[1] = py; 
    c[2] = pz;

    e[0] = r; 
    e[1] = r; 
    e[2] = r;
};

ColliderComponent.Sphere.prototype = new ColliderComponent.CollisionShape();

ColliderComponent.addFlag = (function() {
    var current = 0;
    return function() {
        if(current > 31) throw new Error("Too many collider flags requested!");
        return 1 << current++;
    };
})();