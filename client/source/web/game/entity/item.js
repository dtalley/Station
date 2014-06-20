function ItemComponent() {
    ComponentPrototype.call(this);
}

ItemComponent.prototype = new ComponentPool(ItemComponent, "item");

ItemComponent.prototype.onAttached = function() {

};

ItemComponent.prototype.onDettached = function() {

};