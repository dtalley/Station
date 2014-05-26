function TransformComponent() {
    this.position = vec3.create();
    this.scale = vec3.set(vec3.create(), 1, 1, 1);
    this.rotation = quat.identity(quat.create());

    this.parent = null;

    this.indices = new RingBuffer(20).fillIncremental();
    this.children = new Array(20);
    this.watcher = null;
    this.index = 0;

    this.matrix = mat4.create();
}

TransformComponent.prototype = new ComponentPrototype(TransformComponent);

TransformComponent.prototype.addChild = function(child) {
    if(child.parent===this) return;

    if(child.parent) child.parent.removeChild(child);

    if(this.indices.span > 0)
    {
        var index = this.indices.shift();
        this.children[index] = child;
        child.index = index;
        child.parent = this;
        child.update();
    }
    else
    {
        throw new Error("Attempt to add too many children to TransformComponent.");
    }
};

TransformComponent.prototype.removeChild = function(child) {
    if(child.parent!==this) return;

    this.indices.push(child.index);
    this.children[child.index] = null;
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

    if(options.watcher) this.watcher = options.watcher;
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

    var count = this.indices.length;
    if( this.indices.span < count )
    {
        for( var i = 0; i < count; i++ )
        {
            if(this.children[i])
            {
                this.children[i].update();
            }
        }
    }

    if(this.watcher)
    {
        this.watcher.update();
    }
};