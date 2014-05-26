Interior.DynamicComponent = function() {
   this.character = false;
   this.size = 1;

   this.spawned = false;
   this.container = null;
   this.moved = false;
};

Interior.DynamicComponent.prototype = new ComponentPrototype(Interior.DynamicComponent);

Interior.DynamicComponent.prototype.onAttached = function() {
    
};

Interior.DynamicComponent.prototype.onDetached = function() {
    
};