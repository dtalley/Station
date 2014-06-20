function TransformComponent() {
    ComponentPrototype.call(this);
    
    this.position = vec3.create();
    this.scale = vec3.fromValues(1, 1, 1);
    this.rotation = quat.identity(quat.create());

    this.parent = null;
    this.children = new ObjectRegistry();

    this.matrix = mat4.create();
    this.matrix.buffer.imbue();
    this.storedMatrix = -1;
}

TransformComponent.prototype = new ComponentPool(TransformComponent, "transform");

TransformComponent.prototype.addChild = function(child) {
    if(child.parent===this) return;

    if(child.parent) child.parent.removeChild(child);
    
    this.children.add(child);

    child.parent = this;
    child.update(this);
};

TransformComponent.prototype.removeChild = function(child) {
    if(child.parent!==this) return;

    this.children.remove(child);
    child.parent = null;
    child.update();
};

TransformComponent.prototype.setParent = function(parent) {
    if(this.parent===parent) return;
    if(this.parent) this.parent.removeChild(this);

    if( parent ) parent.addChild(this);
};

TransformComponent.prototype.onAttached = function() {
    this.entity.transform = this;
    this.update();
};

TransformComponent.prototype.onDetached = function() {
    this.entity.transform = null;

    if( this.parent )
    {
        this.parent.removeChild(this);
    }
};

TransformComponent.prototype.configure = function(options) {
    if(options.position) vec3.copy(this.position, options.position);
    if(options.scale) vec3.copy(this.scale, options.scale);
    if(options.rotation) quat.copy(this.rotation, options.rotation);

    if(options.parent) options.parent.addChild(this);
    
    this.update();

    return this;
};

TransformComponent.prototype.update = function(start) {
    if(start === this) return; //Transform loop, could throw error?

    var matrix = this.matrix;

    mat4.fromRotationTranslation(matrix, this.rotation, this.position);
    mat4.scale(matrix, matrix, this.scale);

    if( this.parent )
    {
        mat4.multiply(matrix, this.parent.matrix, matrix);
    }

    var children = this.children.array;
    var count = this.children.length;
    for( var i = 0; i < count; i++ )
    {
        children[i].update(start||this);
    }

    this.entity.emit("move", matrix);
};

TransformComponent.prototype.orphan = function(transform) {
    var parent = this.parent;
    if(parent)
    {
        parent.transformOther(this);
        parent.removeChild(this);
    }
};

TransformComponent.prototype.transformOther = function(transform) {
    var a = transform.position, b = transform.rotation, c = this.rotation;
    vec4.transformQuat(a, a, c);
    vec3.add(a, this.position, a);
    quat.multiply(b, c, b);
};

TransformComponent.prototype.rotateUnitVector4 = function(vector) {
    vector[0] = 0;
    vector[1] = 0;
    vector[2] = 1;
    vector[3] = 1;
    vec4.transformQuat(vector, vector, this.rotation);
};