function DynamicSystem(em, sp) {
    SystemPrototype.call(this);

    this.em = em; //Entity Manager
    this.sp = sp; //Spatial partitioner

    this.actors = new ActorProcessor(this.sp);
    this.containers = new ContainerProcessor(this.sp);
    this.physics = new PhysicsProcessor(this.sp);

    this.movement = vec4.create();
    this.result = vec4.create();
    this.rq = quat.create();

    this.player = this.createActor(true);

    this.camera = this.em.createEntity();
    this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 40, 20),
        rotation: quat.rotateX(quat.create(), quat.zero, -63 * Math.PI / 180)
    });
    this.camera.addComponent(CameraComponent).activate();

    this.createGrid();

    for( var i = 0; i < 4; i++ )
    {
        var crate = this.em.createEntity();
        crate.addComponent(TransformComponent).configure({
            position: vec3.fromValues(4.5 + i, 0.5, 4.5),
            scale: vec3.fromValues(0.5, 0.5, 0.5)
        });
        crate.addComponent(ColliderComponent).configure({
            shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5)
        });
        crate.addComponent(ModelComponent).configure({
            model: window.asset.get("models/test/cube.oml"),
            material: window.asset.get("materials/test/gray.mtrl")
        });
        crate.addComponent(DynamicComponent).configure({
            deployable: true
        });

        this.physics.addComponent(crate.getComponent(ColliderComponent));
    }

    this.cursor = this.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0.5, 0.5, 0.5)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/cube.oml"),
        material: window.asset.get("materials/test/green.mtrl"),
        visible: false
    });
}

DynamicSystem.prototype = new SystemPrototype();

DynamicSystem.prototype.createActor = function(isPlayer) {
    var actor = this.em.createEntity();
    actor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0.5, 0)
    });
    var collider = actor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5)
    });
    actor.addComponent(InputComponent).configure({
        driven: !!isPlayer
    });
    actor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/arrow.oml"),
        material: window.asset.get("materials/test/red.mtrl")
    });
    var dynamic = actor.addComponent(DynamicComponent).configure({
        player: !!isPlayer
    });

    this.actors.addComponent(dynamic);
    this.physics.addComponent(collider);

    return actor;
};

DynamicSystem.prototype.update = function() {
    this.physics.process();
    this.actors.process();
    this.containers.process();
};

DynamicSystem.prototype.createGrid = function() {
    this.grid = this.em.createEntity();
    this.grid.addComponent(TransformComponent).configure({});
    
    var model = new ModelAsset();
    var verts = [];
    var idx = [];

    var span = 64;
    var size = span * span;
    var half = span >>> 1;

    for( var i = 0; i < size; i++ )
    {
        var col = Math.floor(i/span);
        var row = i % span;

        col -= half;
        row -= half;

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
            type: window.gr.Float,
            count: 3
        }
    ];
    model.drawType = window.gr.Lines;
    model.createBuffers();
    
    this.grid.addComponent(ModelComponent).configure({
        material: window.asset.get("materials/test/gray.mtrl"),
        model: model
    });
};