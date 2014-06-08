function SystemPrototype() {
    
}

SystemPrototype.prototype = new EventEmitter();

SystemPrototype.prototype.update = function() {};

function ProcessorPrototype() {
    this.components = new ObjectRegistry();
}

ProcessorPrototype.prototype = new EventEmitter();

ProcessorPrototype.prototype.addComponent = function(component) {
    this.components.add(component);
    this.onComponentAdded(component);
};
ProcessorPrototype.prototype.onComponentAdded = function(component) {};

ProcessorPrototype.prototype.removeComponent = function(component) {
    this.components.remove(component);
    this.onComponentRemoved(component);
};
ProcessorPrototype.prototype.onComponentRemoved = function(component) {};

ProcessorPrototype.prototype.process = function() {};