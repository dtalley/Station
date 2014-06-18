function PhysicsSystem() {
    this.bp = null;
}

PhysicsSystem.prototype = new SystemPrototype("physics", true, false);

PhysicsSystem.prototype.configure = function(bp) {
    this.bp = bp; //Broadphase data structure
};

PhysicsSystem.prototype.initialize = function() {

};

PhysicsSystem.prototype.simulate = function() {
    
};