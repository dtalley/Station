function TransformComponent() {
    this.position = vec3.create();
    this.scale = vec3.set(vec3.create(), 1, 1, 1);
    this.rotation = quat.identity(quat.create());

    this.parent = null;

    this.matrix = mat4.create();
}

TransformComponent.prototype = new ComponentPrototype(TransformComponent);
TransformComponent.prototype.type = "transform";

TransformComponent.prototype.configure = function(options) {
    if(options.position)
    {
        vec3.copy(this.position, options.position);
    }

    if(options.scale)
    {
        vec3.copy(this.scale, options.scale);
    }

    if(options.rotation)
    {
        quat.copy(this.rotation, options.rotation);
    }

    if(options.parent)
    {
        this.parent = options.parent;
    }

    this.update();

    return this;
};

TransformComponent.prototype.update = function() {
    mat4.fromRotationTranslation(this.matrix, this.rotation, this.position);
    mat4.scale(this.matrix, this.matrix, this.scale);

    if( this.parent )
    {
        this.parent.update();
        mat4.multiply(this.matrix, this.parent.matrix, this.matrix);
    }
};