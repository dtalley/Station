function ProcessorPrototype() {
    this.children = [];
    this.entities = [];
}

ProcessorPrototype.prototype.update = function(dt) {
    
};

ProcessorPrototype.prototype.addChild = function(processor) {
    this.children.push(processor);

    return processor;
};