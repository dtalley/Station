function PhysicsProcessor(sp) {
    ProcessorPrototype.call(this);

    this.sp = sp; //Spatial partitioner
}

PhysicsProcessor.prototype = new ProcessorPrototype();

PhysicsProcessor.prototype.onComponentAdded = function(collider) {
    this.sp.insert(collider);
};

PhysicsProcessor.prototype.onComponentRemoved = function(collider) {
    this.sp.remove(collider);
};

PhysicsProcessor.prototype.process = function() {

};