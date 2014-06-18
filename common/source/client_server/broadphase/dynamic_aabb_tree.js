function DynamicAABBTree() {
    this.colliders = new ObjectRegistry();
}

DynamicAABBTree.prototype.insert = function(collider) {
    this.colliders.add(collider);
    collider.node = true;
};

DynamicAABBTree.prototype.remove = function(collider) {
    this.colliders.remove(collider);
    collider.node = null;
};

DynamicAABBTree.prototype.update = function() {

};

DynamicAABBTree.prototype.query = function(aabb, flags, callback, owner, context) {
    if(!callback) return;

    var r = 0;
    var next = true;
    var c = this.colliders.length;
    for( var i = 0; next && i < c; i++ )
    {
        var collider = this.colliders.array[i];
        if( ( !flags || ( flags & collider.flags ) > 0 ) && collider.aabb.intersects(aabb) )
        {
            r++;
            next = callback.call(owner, false, collider, context);
        }
    }

    if( r === 0 )
    {
        callback.call(owner, true, null, context);
    }
};