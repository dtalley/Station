function ContainerSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.chunkSize = 16;
    this.chunkPosition = vec4.fromValues(0.5, 0, 0.5, 1);
    this.chunkOffset = vec4.fromValues(-0.5, 0, -0.5, 1);
    this.result = vec4.create();

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
    vec4.transformQuat(this.result, this.chunkOffset, transform.rotation);
    vec3.add(this.result, this.result, transform.position);

    var spaceX = Math.floor(this.chunkSize/2);
    var spaceY = Math.floor(this.chunkSize/2);

    this.result[0] -= spaceX;
    this.result[2] -= spaceY;

    var entity = this.em.createEntity();
    var container = entity.addComponent(ContainerComponent).configure({
        chunkSize: this.chunkSize
    });
    entity.addComponent(TransformComponent).configure({
        position: this.result,
        rotation: transform.rotation
    });

    var chunk = this.createChunk(container, 0, 0);
    var space = chunk.getSpace(spaceX, spaceY);
    space = chunk.addStrut(space);
    chunk.modifySpace(spaceX, spaceY, space);
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
    var chunkFloor = floor.addComponent(ChunkFloorComponent).configure({
        x: x,
        y: y,
        container: container,
        size: this.chunkSize
    });

    this.result[0] = x * this.chunkSize;
    this.result[1] = 0;
    this.result[2] = y * this.chunkSize;
    vec3.add(this.result, this.result, this.chunkPosition);

    floor.addComponent(TransformComponent).configure({
        parent: container.entity.transform,
        position: this.result
    });

    return chunkFloor;
};

ColliderComponent.Flags.Floor = ColliderComponent.addFlag();
ColliderComponent.Flags.Wall = ColliderComponent.addFlag();