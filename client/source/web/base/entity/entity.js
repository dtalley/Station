function Entity(id) {
    this.id = id;
}

function EntityManager() {
    this.pool = [];
    this.counter = 0;
}

EntityManager.prototype.createEntity = function() {
    if( this.pool.length > 0 )
    {
        return this.pool.pop();
    }

    return new Entity(++this.counter);
};

EntityManager.prototype.releaseEntity = function(entity) {
    this.pool.push(entity);
};