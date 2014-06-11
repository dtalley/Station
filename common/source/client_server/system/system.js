function SystemPrototype() {
    
}

SystemPrototype.prototype = new EventEmitter();

SystemPrototype.prototype.update = function() {};

function ProcessorPrototype() {}

ProcessorPrototype.prototype = new EventEmitter();

ProcessorPrototype.prototype.process = function() {};