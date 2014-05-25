function SystemPrototype() {
    this.processors = [];
}

SystemPrototype.prototype.addProcessor = function(processor) {
    this.processors.push(processor);
    return processor;
}

SystemPrototype.prototype.update = function(dt) {
    this.processors.forEach(function(processor){
        processor.update(dt);
    });
}