function PhysicsSystem(bp) {
    SystemPrototype.call(this);

    this.bp = bp; //Broadphase data structure
}

PhysicsSystem.prototype = new SystemPrototype();

PhysicsSystem.prototype.update = function() {
    
};