ChunkFloorComponent = function(flags) {
    ComponentPrototype.call(this, flags);

    this.x = 0;
    this.y = 0;
    this.container = null;
};

ChunkFloorComponent.prototype = new ComponentPool(ChunkFloorComponent, "chunk_floor");

ChunkFloorComponent.prototype.onAttached = function() {
    
};

ChunkFloorComponent.prototype.onDetached = function() {
    
};

ChunkFloorComponent.prototype.configure = function(options) {
    if(options.x !== undefined) this.x = options.x;
    if(options.y !== undefined) this.y = options.y;
    if(options.container !== undefined) this.container = options.container;

    return this;
};