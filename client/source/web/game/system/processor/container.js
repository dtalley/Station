function ContainerProcessor(sp) {
    ProcessorPrototype.call(this);

    this.sp = sp; //Spatial partitioner
}

ContainerProcessor.prototype = new ProcessorPrototype();

ContainerProcessor.prototype.process = function() {

};