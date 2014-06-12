function PhysicsProcessor(em, bp) {
    ProcessorPrototype.call(this);

    this.em = em; //Entity manager;
    this.bp = bp; //Broadphase data structure
}

PhysicsProcessor.prototype = new ProcessorPrototype();

PhysicsProcessor.prototype.process = function(rigidBody) {

};