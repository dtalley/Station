function DynamicAABBTree() {
    this.colliders = new ObjectRegistry();
}

DynamicAABBTree.prototype.insert = function(collider) {
    this.colliders.add(collider);
};

DynamicAABBTree.prototype.remove = function(collider) {
    this.colliders.remove(collider);
};

DynamicAABBTree.prototype.update = function() {

};

DynamicAABBTree.prototype.query = function(aabb, flags, callback, owner) {
    if(!callback) return;

    var r = 0;
    var c = this.colliders.length;
    for( var i = 0; i < c; i++ )
    {
        var collider = this.colliders.array[i];
        if( ( !flags || ( flags & collider.flags ) > 0 ) && collider.aabb.intersects(aabb) )
        {
            r++;
            if( !callback.call(owner, collider) ) return;
        }
    }

    if( r === 0 )
    {
        callback.call(owner, null, true);
    }
};