var Interior = {};

Interior.ContainerComponent = function() {
   this.loaded = false;

   var size = this.size = 16;
   this.shift = 0;
   while((size >>>= 1) !== 0) this.shift++;
   this.width = 1;
   this.height = 1;

   this.buffer = new Uint32Array(this.size * this.size * this.width * this.height * 2);

   this.chunks = new Array(this.width * this.height);
};

Interior.ContainerComponent.prototype = new ComponentPrototype(Interior.ContainerComponent);

Interior.ContainerComponent.prototype.storeChunk = function(entity) {

};

Interior.ContainerComponent.prototype.onAttached = function() {
    
};

Interior.ContainerComponent.prototype.onDetached = function() {
    
};

Interior.ContainerComponent.prototype.configure = function(options) {
    if(options.width) this.width = options.width;
    if(options.height) this.height = options.height;

    if(options.size) {
        this.size = options.size;
        this.shift = 0;
        while((options.size >>>= 1) !== 0) this.shift++;
    }
};