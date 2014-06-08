function DynamicAABBTree() {
    this.colliders = new ObjectRegistry();
    this.results = new ObjectRegistry();
}

DynamicAABBTree.prototype.insert = function(collider) {
    this.colliders.add(collider);
};

DynamicAABBTree.prototype.remove = function(collider) {
    this.colliders.remove(collider);
};

DynamicAABBTree.prototype.update = function() {

};

DynamicAABBTree.prototype.query = function(shape) {
    this.results.clear();
};