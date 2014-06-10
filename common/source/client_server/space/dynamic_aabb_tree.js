function DynamicAABBTree() {
    this.colliders = new ObjectRegistry();
    this.results = new ObjectRegistry();

    this.r1 = vec3.create();
    this.r2 = vec3.create();
    this.r3 = vec3.create();
    this.r4 = vec3.create();
}

DynamicAABBTree.prototype.insert = function(collider) {
    this.colliders.add(collider);
};

DynamicAABBTree.prototype.remove = function(collider) {
    this.colliders.remove(collider);
};

DynamicAABBTree.prototype.update = function() {

};

DynamicAABBTree.prototype.query = function(aabb) {
    this.results.clear();

    var c = this.colliders.length;
    for( var i = 0; i < c; i++ )
    {
        var collider = this.colliders.array[i];
        if( collider.aabb.intersects(aabb) )
        {
            this.results.add(collider);
        }
    }
};