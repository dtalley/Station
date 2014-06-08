function Entity(id) {
    this.id = id;
    this.components = [];
    this.indices = new RingBuffer();

    //Common components
    this.transform = null;
    this.camera = null;
    this.model = null;
    this.input = null;
    this.collider = null;
}

Entity.prototype.addComponent = function(component, flags) {
    var instance = component;
    if( typeof component === "function" )
    {
        instance = component.prototype.create(flags).attach(this);
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

function ComponentPrototype() {
    this.id = 0;
    this.index = 0;
}

ComponentPrototype.prototype.attach = function(entity) {
    this.entity = entity;
    this.onAttached();

    return this;
};
ComponentPrototype.prototype.onAttached = function(){};

ComponentPrototype.prototype.detach = function() {
    this.onDetached();
    this.entity = null;

    return this;
};
ComponentPrototype.prototype.onDetached = function(){};

ComponentPrototype.prototype.configure = function(options){
    _.extend(this, options);
    return this;
};

function ComponentPool(constructor) {
    this.entity = null;
    this.pool = [];
    this.stack = [];
    this.constructor = constructor;
}

ComponentPool.prototype = new ComponentPrototype();

ComponentPool.prototype.release = function() {
    this.pool.push(this);

    return this;
};

ComponentPool.prototype.create = function(flags) {
    if( this.pool.length > 0 )
    {
        var component = this.pool.pop();
        component.flags = flags;
        return component;
    }

    this.stack.push(new this.constructor(flags));
    this.stack[this.stack.length-1].id = this.stack.length - 1;
    return this.stack[this.stack.length-1];
};