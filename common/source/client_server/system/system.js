function SystemManager() {
    this.systemReference = {};
    this.simulators = [];
    this.renderers = [];
}

SystemManager.prototype.addSystem = function(constructor) {
    var system = new constructor();
    system.manager = this;
    console.log(system);
    if( system.isSimulator )
    {
        this.simulators.push(system);
    }

    if( system.isRenderer )
    {
        this.renderers.push(system);
    }

    console.log(this);

    this.systemReference[system.type] = system;
    return system;
};

SystemManager.prototype.getSystem = function(constructor) {
    var type = constructor.prototype.type;

    if( this.systemReference[type] )
    {
        return this.systemReference[type];
    }

    return null;
};

SystemManager.prototype.initialize = function() {
    var index = this.simulators;
    var count = index.length;
    for( var i = 0; i < count; i++ )
    {
        index[i].initialize();
    }
};

SystemManager.prototype.simulate = function() {
    var index = this.simulators;
    var count = index.length;
    for( var i = 0; i < count; i++ )
    {
        index[i].simulate();
    }
};

SystemManager.prototype.render = function() {
    var index = this.renderers;
    var count = index.length;
    for( var i = 0; i < count; i++ )
    {
        index[i].render();
    }
};

function SystemPrototype(type, isSimulator, isRenderer) {
    this.type = type;
    this.isSimulator = isSimulator;
    this.isRenderer = isRenderer;
    this.manager = null;
}

SystemPrototype.prototype = new EventEmitter();

SystemPrototype.prototype.configure = function() {};
SystemPrototype.prototype.initialize = function() {};
SystemPrototype.prototype.simulate = function() {};
SystemPrototype.prototype.render = function() {};