ContainerComponent = function(flags) {
    ComponentPrototype.call(this, flags);

    this.loaded = false;

    var size = this.size = 16;
    this.shift = 0;
    while((size >>>= 1) !== 0) this.shift++;
    this.width = 1;
    this.height = 1;
};

ContainerComponent.prototype = new ComponentPool(ContainerComponent);

ContainerComponent.prototype.storeChunk = function(entity) {

};

ContainerComponent.prototype.onAttached = function() {
    
};

ContainerComponent.prototype.onDetached = function() {
    
};

ContainerComponent.prototype.configure = function(options) {
    if(options.width) this.width = options.width;
    if(options.height) this.height = options.height;

    if(options.size) {
        this.size = options.size;
        this.shift = 0;
        while((options.size >>>= 1) !== 0) this.shift++;
    }
};