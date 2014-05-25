function Entity(id) {
    this.id = id;
    this.components = [];
    this.indices = new RingBuffer(10);
}

Entity.prototype.addComponent = function(component) {
    var instance = component;
    if( typeof component === "function" )
    {
        instance = component.prototype.create().attach(this);
    }

    if( !instance )
    {
        return null;
    }
    
    if( this.indices.span > 0 )
    {
        instance.index = this.indices.shift();
        this.components[instance.index] = instance;
    }
    else
    {
        instance.index = this.components.length;
        this.components.push(instance);
    }

    return instance;
};

Entity.prototype.removeComponent = function(component) {
    var instance = component;
    if( typeof component === "function" )
    {
        var exists = this.components.some(function(candidate){
            if( candidate && candidate.constructor === component )
            {
                instance = candidate;
                return true;
            }

            return false;
        });
        if(!exists)return null;
    }
        
    this.indices.push(instance.index);
    this.components[instance.index] = null;
    instance.detach();
    return instance;
};

Entity.prototype.getComponent = function(component) {
    var instance = null;
    this.components.some(function(candidate){
        if( candidate && candidate.constructor === component )
        {
            instance = candidate;
            return true;
        }

        return false;
    });
    return instance;
};

function EntityManager() {
    this.pool = [];
    this.stack = [];
    this.counter = 0;
}

EntityManager.prototype.createEntity = function() {
    if( this.pool.length > 0 )
    {
        return this.pool.pop();
    }

    this.stack.push(new Entity(this.counter++));
    return this.stack[this.stack.length-1];
};

EntityManager.prototype.releaseEntity = function(entity) {
    this.pool.push(entity);
};

function ComponentPrototype(constructor) {
    this.entity = null;
    this.pool = [];
    this.stack = [];
    this.constructor = constructor;
    this.index = 0;
}

ComponentPrototype.prototype.type = "none";

ComponentPrototype.prototype.create = function() {
    if( this.pool.length > 0 )
    {
        return this.pool.pop();
    }

    this.stack.push(new this.constructor());
    return this.stack[this.stack.length-1];
};

ComponentPrototype.prototype.attach = function(entity) {
    this.entity = entity;

    this.onAttached(entity);

    return this;
};
ComponentPrototype.prototype.onAttached = function(){};

ComponentPrototype.prototype.detach = function() {
    this.entity = null;

    this.onDetached();

    return this;
};
ComponentPrototype.prototype.onDetached = function(){};

ComponentPrototype.prototype.release = function() {
    this.pool.push(this);

    return this;
};