DynamicComponent = function(flags) {
  ComponentPrototype.call(this, flags);

  this.character = false;
  this.player = false;
  this.deployable = false;
  this.using = false;

  this.movement = new Float32Array(2);
  this.movement[0] = 0;
  this.movement[1] = 0;

  this.holding = null;
  this.targeting = null;
};

DynamicComponent.player = null;

DynamicComponent.prototype = new ComponentPool(DynamicComponent);

DynamicComponent.prototype.onAttached = function() {
    if( this.player )
    {
        DynamicComponent.player = this;
    }
};

DynamicComponent.prototype.onDetached = function() {
    if( this.player && Interior.DynamicComponent.player === this )
    {
        Interior.DynamicComponent.player = null;
    }
};