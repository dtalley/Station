function ContainerProcessor(em, bp) {
    ProcessorPrototype.call(this);

    this.em = em; //Entity manager
    this.bp = bp; //Broadphase data structure
}

ContainerProcessor.prototype = new ProcessorPrototype();

ContainerProcessor.prototype.process = function(container) {

};