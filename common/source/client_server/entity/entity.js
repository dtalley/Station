function Entity(em, id) {
    EventEmitter.call(this);
    
    this.em = em;
    this.id = id;
    this.components = {};
    this.indices = new RingBuffer();

    //Common components
    this.transform = null;
    this.camera = null;
    this.model = null;
    this.input = null;
    this.collider = null;

    this.props = {};
}

Entity.prototype = new EventEmitter();

Entity.prototype.addComponent = function(component, flags) {
    var instance = component;
    if( typeof component === "function" )
    {
        instance = component.prototype.create(flags);
    }

    if( !instance )
    {
        return null;
    }
    
    if( this.components[instance.type] )
    {
        throw new Error("Attempt to add duplicate component.");
    }

    this.components[instance.type] = instance;
    instance.attach(this);

    return instance;
};

Entity.prototype.removeComponent = function(component) {
    if(!component) return null;

    var instance = component;
    if( typeof component === "function" )
    {
        instance = this.components[component.prototype.type];
    }

    if(!instance)
    {
        return null;
    }
    
    if( !this.components[instance.type] || this.components[instance.type] !== instance )
    {
        return instance;
    }

    this.components[instance.type] = null;
    instance.detach();
    return instance;
};

Entity.prototype.getComponent = function(component) {
    var instance = this.components[component.prototype.type];
    return instance;
};

Entity.prototype.strip = function() {
    for( var key in this.components )
    {
        var instance = this.removeComponent(this.components[key]);
        if( instance ) instance.release();
    }
};

function EntityManager() {
    this.pool = new StackPool();
    this.stack = [];
    this.counter = 0;
}

EntityManager.prototype.createEntity = function() {
    if( this.pool.length > 0 )
    {
        return this.pool.pop();
    }

    this.stack.push(new Entity(this, this.counter++));
    return this.stack[this.stack.length-1];
};

EntityManager.prototype.releaseEntity = function(entity) {
    entity.strip();
    this.pool.push(entity);
};

function ComponentPrototype() {
    this.id = 0;
}

ComponentPrototype.prototype = new EventEmitter();

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

function ComponentPool(constructor, type) {
    this.entity = null;
    this.pool = [];
    this.stack = [];
    this.constructor = constructor;
    this.type = type;
}

ComponentPool.prototype = new ComponentPrototype();

ComponentPool.prototype.release = function() {
    this.pool.push(this);

    return this;
};

ComponentPool.prototype.create = function() {
    if( this.pool.length > 0 )
    {
        var component = this.pool.pop();
        return component;
    }

    this.stack.push(new this.constructor());
    this.stack[this.stack.length-1].id = this.stack.length - 1;
    return this.stack[this.stack.length-1];
};