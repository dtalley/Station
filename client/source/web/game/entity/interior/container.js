var Interior = {};

Interior.ContainerComponent = function() {
   this.loaded = false;

   var size = this.size = 32;
   this.shift = 0;
   while((size >>>= 1) !== 0) this.shift++;
   this.width = 30;
   this.height = 30;

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