function DynamicSystem(bp) {
    SystemPrototype.call(this);

    this.dynamics = DynamicComponent.prototype.stack;

    this.actors = ActorComponent.prototype.stack;
    this.containers = ContainerComponent.prototype.stack;

    this.bp = bp; //Broadphase data structure

    this.player = this.createActor(true);

    this.camera = window.em.createEntity();
    this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 40, 20),
        rotation: quat.rotateX(quat.create(), quat.zero, -63 * Math.PI / 180)
    });
    this.camera.addComponent(CameraComponent).activate();

    this.createGrid();

    for( var i = 0; i < 4; i++ )
    {
        var crate = window.em.createEntity();
        crate.addComponent(TransformComponent).configure({
            position: vec3.fromValues(4.5 + i, 0.5, 4.5),
            scale: vec3.fromValues(0.5, 0.5, 0.5)
        });
        crate.addComponent(ColliderComponent).configure({
            shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
            flags: DynamicSystem.Usable,
            broadphase: this.bp
        });
        crate.addComponent(ModelComponent).configure({
            model: window.asset.get("models/test/cube.oml"),
            material: window.asset.get("materials/test/gray.mtrl")
        });
        crate.addComponent(DeployableComponent);
    }
}

DynamicSystem.prototype = new SystemPrototype();

DynamicSystem.prototype.createActor = function(isPlayer) {
    var actor = window.em.createEntity();
    actor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0.5, 0)
    });
    actor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
        flags: DynamicSystem.Character,
        broadphase: this.bp
    });
    actor.addComponent(InputComponent).configure({
        driven: !!isPlayer
    });
    actor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/arrow.oml"),
        material: window.asset.get("materials/test/red.mtrl")
    });
    actor.addComponent(ActorComponent).configure({
        player: !!isPlayer,
        broadphase: this.bp
    });

    return actor;
};

DynamicSystem.prototype.update = function() {
    var count = this.containers.length, i = 0;
    for( i = 0; i < count; i++ )
    {
        this.containers[i].update();
    }  

    count = this.actors.length;
    for( i = 0; i < count; i++ )
    {
        this.actors[i].update();
    }
};

DynamicSystem.prototype.createGrid = function() {
    this.grid = window.em.createEntity();
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

DynamicSystem.Character = ColliderComponent.addFlag();
DynamicSystem.Usable = ColliderComponent.addFlag();
DynamicSystem.Container = ColliderComponent.addFlag();

DynamicSystem.prototype.handlePlayerDeploy = function(player, deployable) {
    var entity = deployable.entity, transform = entity.transform, dynamic = entity.components.dynamic;

    transform.scale[0] = 1;
    transform.scale[1] = 0.25;
    transform.scale[2] = 1;
    transform.detach();
    transform.position[1] = 0.125;
    transform.update();

    entity.removeComponent(DeployableComponent);
    dynamic.deployable = null;
    entity.model.material = window.asset.get("materials/test/yellow.mtrl");
    dynamic.container = entity.addComponent(ContainerComponent);
    entity.collider.flags ^= DynamicSystem.Usable;
    entity.collider.flags ^= DynamicSystem.Container;
};