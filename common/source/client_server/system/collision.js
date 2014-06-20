function CollisionSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.broadphase = null;
}

CollisionSystem.prototype = new SystemPrototype("collision", false, false);

CollisionSystem.prototype.configure = function(options) {
    if( options.broadphase === CollisionSystem.DynamicAABBTree )
    {
        this.broadphase = new DynamicAABBTree();
    }
    else
    {
        throw new Error("Unsupported or unspecified broadphase passed to CollisionSystem.");
    }
};

CollisionSystem.prototype.initialize = function() {
    ColliderComponent.prototype.on("update", this.handleColliderUpdate, this);
    ColliderComponent.prototype.on("detach", this.handleColliderDetach, this);
};

CollisionSystem.prototype.handleColliderUpdate = function(collider) {
    if(!collider.node)
    {
        this.broadphase.insert(collider);
    }
};

CollisionSystem.prototype.handleColliderDetach = function(collider) {
    if(collider.node)
    {
        this.broadphase.remove(collider);
    }
};

CollisionSystem.DynamicAABBTree = 1;