ChunkFloorComponent = function(flags) {
    ComponentPrototype.call(this, flags);

    this.x = 0;
    this.y = 0;
    this.container = null;

    this.data = null;
};

ChunkFloorComponent.prototype = new ComponentPool(ChunkFloorComponent, "chunk_floor");

ChunkFloorComponent.prototype.onAttached = function() {
    
};

ChunkFloorComponent.prototype.onDetached = function() {
    
};

ChunkFloorComponent.prototype.configure = function(options) {
    if(options.x !== undefined) this.x = options.x & 0xFFFFFFFF;
    if(options.y !== undefined) this.y = options.y & 0xFFFFFFFF;
    if(options.container !== undefined) this.container = options.container;
    if(options.size !== undefined) this.size = options.size & 0xFFFF;

    if(this.container)
    {
        this.container.addChunk(this, this.x, this.y);
    }

    this.data = new Int32Array(this.size*this.size);

    return this;
};

ChunkFloorComponent.prototype.getSpace = function(x, y) {
    if(x >= this.size )
    {
        throw new Error("X coordinate out of bounds of chunk.");
    }

    if(y >= this.size )
    {
        throw new Error("Y coordinate out of bounds of chunk.");
    }

    return this.data[(y*this.size)+x];
};

ChunkFloorComponent.prototype.modifySpace = function(x, y, data) {
    if(x >= this.size )
    {
        throw new Error("X coordinate out of bounds of chunk.");
    }

    if(y >= this.size )
    {
        throw new Error("Y coordinate out of bounds of chunk.");
    }

    this.data[(y*this.size)+x] = data;
};

ChunkFloorComponent.prototype.addStrut = function(data) {
    data = data | 1;
    return data;
};

ChunkFloorComponent.prototype.removeStrut = function(data) {
    data = data & ( 0xFFFFFFFF ^ 1 );
    return data;
};