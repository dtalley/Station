function ItemComponent() {
    ComponentPrototype.call(this);

    this.owner = null;
    
    this.timer = 0.0;

    this.deploying = false;
}

ItemComponent.prototype = new ComponentPool(ItemComponent, "item");

ItemComponent.prototype.onAttached = function() {

};

ItemComponent.prototype.onDettached = function() {

};