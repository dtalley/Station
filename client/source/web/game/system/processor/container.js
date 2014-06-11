function ContainerProcessor(em, sp) {
    ProcessorPrototype.call(this);

    this.em = em; //Entity manager
    this.sp = sp; //Spatial partitioner
}

ContainerProcessor.prototype = new ProcessorPrototype();

ContainerProcessor.prototype.process = function() {

};