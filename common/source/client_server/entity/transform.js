function TransformComponent() {
    ComponentPrototype.call(this);
    
    this.position = vec3.create();
    this.scale = vec3.fromValues(1, 1, 1);
    this.rotation = quat.identity(quat.create());

    this.parent = null;

    this.indices = new RingBuffer();
    this.children = [];
    this.watchers = 0;
    this.index = 0;

    this.matrix = mat4.create();
    this.matrix.buffer.imbue();
    this.storedMatrix = -1;
}

TransformComponent.prototype = new ComponentPool(TransformComponent, "transform");

TransformComponent.prototype.addChild = function(child) {
    if(child.parent===this) return;

    if(child.parent) child.parent.removeChild(child);

    if(this.indices.span > 0)
    {
        var index = this.indices.shift();
        this.children[index] = child;
        child.index = index;
    }
    else
    {
        this.children.push(child);
        child.index = this.children.length-1;
    }

    child.parent = this;
    child.update();
};

TransformComponent.prototype.removeChild = function(child) {
    if(child.parent!==this) return;

    this.indices.push(child.index);
    this.children[child.index] = null;
    child.parent = null;
    child.update();
};

TransformComponent.prototype.setParent = function(parent) {
    if(this.parent) this.parent.removeChild(this);

    if( parent ) parent.addChild(this);
};

TransformComponent.prototype.onAttached = function() {
    this.entity.transform = this;
    this.update();
};

TransformComponent.prototype.onDetached = function() {
    this.entity.transform = null;
};

TransformComponent.prototype.configure = function(options) {
    if(options.position) vec3.copy(this.position, options.position);
    if(options.scale) vec3.copy(this.scale, options.scale);
    if(options.rotation) quat.copy(this.rotation, options.rotation);

    if(options.parent) options.parent.addChild(this);
    
    this.update();

    return this;
};

TransformComponent.prototype.update = function() {
    mat4.fromRotationTranslation(this.matrix, this.rotation, this.position);
    mat4.scale(this.matrix, this.matrix, this.scale);

    if( this.parent )
    {
        mat4.multiply(this.matrix, this.parent.matrix, this.matrix);
    }

    var count = this.children.length;
    for( var i = 0; i < count; i++ )
    {
        if(this.children[i])
        {
            this.children[i].update();
        }
    }

    if(this.watchers)
    {
        this.emit("update", this);
    }
};

TransformComponent.prototype.rotateUnitVector4 = function(vector) {
    vector[0] = 0;
    vector[1] = 0;
    vector[2] = 1;
    vector[3] = 1;
    vec4.transformQuat(vector, vector, this.rotation);
};