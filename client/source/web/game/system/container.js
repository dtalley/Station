function ContainerSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.chunkSize = 16;
    this.chunkOffset = vec4.fromValues(0.5, 0, 0.5, 1);
    this.result = vec4.create();

    this.containers = ContainerComponent.prototype.stack;

    this.gridModel = this.createGrid();
}

ContainerSystem.prototype = new SystemPrototype("container", true, false);

ContainerSystem.prototype.configure = function() {
    
};

ContainerSystem.prototype.initialize = function() {

};

ContainerSystem.prototype.simulate = function() {

};

ContainerSystem.prototype.createGrid = function() {
    var model = new ModelAsset();
    var verts = [];
    var idx = [];

    var span = this.chunkSize;
    var size = span * span;
    var half = span >>> 1;

    for( var i = 0; i < size; i++ )
    {
        var col = Math.floor(i/span);
        var row = i % span;

        //col -= half;
        //row -= half;

        verts = verts.concat([
            col * 1.0, 0.0, row * 1.0,
            col * 1.0, 0.0, row * 1.0 + 1.0,
            col * 1.0 + 1.0, 0.0, row * 1.0 + 1.0,
            col * 1.0 + 1.0, 0.0, row * 1.0
        ]);

        var str = i * 4;
        idx = idx.concat([
            str, str + 1, str + 2, 
            str + 1, str + 2, str + 3,
            str + 2, str + 3, str,
            str + 3, str, str + 1
        ]);
    }
    
    model.vertices = new Float32Array(verts);
    model.indices = new Uint16Array(idx);
    model.attributes = [
        {
            name: "position",
            type: window.graphics.Float,
            count: 3
        }
    ];
    model.drawType = window.graphics.Lines;
    model.createBuffers();
    
    return model;
};

ContainerSystem.prototype.createContainer = function(transform) {
    var spaceX = Math.floor(this.chunkSize/2);
    var spaceY = Math.floor(this.chunkSize/2);

    this.result[0] = 0 - spaceX;
    this.result[1] = 0;
    this.result[2] = 0 - spaceY;
    this.result[3] = 1;

    vec3.add(this.result, this.result, this.chunkOffset);
    vec4.transformQuat(this.result, this.result, transform.rotation);
    vec3.add(this.result, this.result, transform.position);

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
        model: this.gridModel,
        material: window.asset.get("materials/test/yellow.mtrl")
    });
    var size = Math.floor(this.chunkSize/2);
    floor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.BoxGrid(size, 0.25, size, this.chunkSize, 1, this.chunkSize, 1, 1, 1),
        flags: ColliderComponent.Flags.Floor
    });
    var chunkFloor = floor.addComponent(ChunkFloorComponent).configure({
        x: x,
        y: y,
        container: container,
        size: this.chunkSize
    });

    floor.addComponent(TransformComponent).configure({
        parent: container.entity.transform
    });

    return chunkFloor;
};

ColliderComponent.Flags.Floor = ColliderComponent.addFlag();
ColliderComponent.Flags.Wall = ColliderComponent.addFlag();