Interior.DynamicComponent = function() {
   this.character = false;
   this.player = false;

   this.size = 1;

   this.movement = new Float32Array(2);
   this.movement[0] = 0;
   this.movement[1] = 0;

   this.tile = new Uint16Array(2);
   this.tile[0] = 0;
   this.tile[1] = 0;

   this.spawned = false;
   this.container = null;
   this.chunk = null;
};

Interior.DynamicComponent.prototype = new ComponentPrototype(Interior.DynamicComponent);

Interior.DynamicComponent.prototype.onAttached = function() {
    
};

Interior.DynamicComponent.prototype.onDetached = function() {
    
};