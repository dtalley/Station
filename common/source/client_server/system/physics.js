function PhysicsSystem(sm, em) {
    this.sm = sm;
    this.em = em;
}

PhysicsSystem.prototype = new SystemPrototype("physics", true, false);

PhysicsSystem.prototype.configure = function(bp) {
    
};

PhysicsSystem.prototype.initialize = function() {

};

PhysicsSystem.prototype.simulate = function() {
    
};