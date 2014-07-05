ContainerComponent = function() {
    ComponentPrototype.call(this);

    this.rotate = quat.create();
    this.result = vec4.create();

    this.chunks = {};
    this.chunkSize = 0;
};

ContainerComponent.prototype = new ComponentPool(ContainerComponent, "container");

ContainerComponent.prototype.onAttached = function() {
    
};

ContainerComponent.prototype.onDetached = function() {
    
};

ContainerComponent.prototype.configure = function(options) {
    if(options.chunkSize!==undefined)this.chunkSize = options.chunkSize & 0xFFFFFFFF;

    return this;
};

ContainerComponent.prototype.addChunk = function(chunk, x, y) {
    var check = x & 0xFFFF0000;
    if(check !== 0xFFFF0000 && check !== 0)
    {
        throw new Error("X coordinate of chunk is too large.");
    }

    check = y & 0xFFFF0000;
    if(check !== 0xFFFF0000 && check !== 0)
    {
        throw new Error("Y coordinate of chunk is too large.");
    }

    var key = ( x << 16 ) | ( y & 0xFFFF );
    this.chunks[key] = chunk;
};

ContainerComponent.prototype.calculatePosition = function(out, a) {
    var t = this.entity.transform, b = t.position, c = t.rotation, d = this.rotate;
    vec3.subtract(out, a, b);
    quat.invert(d, c);
    vec4.transformQuat(out, out, d);
};

ContainerComponent.prototype.repositionTransform = function(out, offset) {
    var rt = this.result,
        tf = this.entity.transform, 
        tr = tf.rotation, 
        tp = tf.position, 
        op = out.position, 
        or = out.rotation;

    rt[0] = Math.floor(offset[0]) + 0.5;
    rt[1] = 0;
    rt[2] = Math.floor(offset[2]) + 0.5;

    vec4.transformQuat(rt, rt, tr);
    vec4.add(op, rt, tp);
    quat.identity(or);
    tf.rotateOther(out);
    out.update();
};

ContainerComponent.prototype.getSpace = function(pos) {
    var spaceX = Math.floor(pos[0]) & 0xFFFFFFFF;
    var spaceY = Math.floor(pos[2]) & 0xFFFFFFFF;

    var key = ( spaceX << 16 ) | ( spaceY & 0xFFFF );

    var chunk = this.chunks[key];
    if(!chunk)
    {
        return null;
    }

    return chunk.getSpace(spaceX - ( this.chunkSize * chunk.x ), spaceY - ( this.chunkSize * chunk.y ));
};