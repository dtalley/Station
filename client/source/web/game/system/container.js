function ContainerSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.chunkSize = 16;

    this.containers = ContainerComponent.prototype.stack;
}

ContainerSystem.prototype = new SystemPrototype("container", true, false);

ContainerSystem.prototype.configure = function() {
    
};

ContainerSystem.prototype.initialize = function() {

};

ContainerSystem.prototype.simulate = function() {

};

ContainerSystem.prototype.createContainer = function(transform) {
    var entity = this.em.createEntity();
    var container = entity.addComponent(ContainerComponent);
    entity.addComponent(TransformComponent).configure({
        position: transform.position,
        rotation: transform.rotation
    });

    this.createChunk(container, 0, 0);
};

ContainerSystem.prototype.createChunk = function(container, x, y) {
    var floor = this.em.createEntity();
    floor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/strut.oml"),
        material: window.asset.get("materials/test/yellow.mtrl")
    });
    floor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.BoxGrid(0, 0.25, 0, this.chunkSize, 1, this.chunkSize, 1, 1, 1),
        flags: ColliderComponent.Flags.Floor
    });
    floor.addComponent(ChunkFloorComponent).configure({
        x: x,
        y: y,
        container: container
    });
    floor.addComponent(TransformComponent).configure({
        parent: container.entity.transform
    });
};

ColliderComponent.Flags.Floor = ColliderComponent.addFlag();
ColliderComponent.Flags.Wall = ColliderComponent.addFlag();