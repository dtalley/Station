function ActorSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.actors = ActorComponent.prototype.stack;

    this.movement = vec4.fromValues(0, 0, 0, 1);
}

ActorSystem.prototype = new SystemPrototype("actor", true, false);

ActorSystem.prototype.configure = function() {
    
};

ActorSystem.prototype.initialize = function() {
    this.container = this.sm.getSystem(ContainerSystem);
    this.item = this.sm.getSystem(ItemSystem);
    this.collision = this.sm.getSystem(CollisionSystem);

    this.grabShape = new ColliderComponent.Sphere(0, 0.5, -1, 0, 0, -0.1, Math.PI / 2);
    this.queryAABB = new aabb();

    this.player = this.createActor(true);

    this.camera = this.em.createEntity();
    this.camera.addComponent(CameraComponent).activate();
    this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 40, 20),
        rotation: quat.rotateX(quat.create(), quat.zero, -63 * Math.PI / 180)
    });

    this.createGrid();
};

ActorSystem.prototype.createActor = function(isPlayer) {
    var actor = this.em.createEntity();
    actor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
        flags: ColliderComponent.Flags.Character
    });
    actor.addComponent(InputComponent).configure({ 
        driven: !!isPlayer
    });
    actor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/arrow.oml"),
        material: window.asset.get("materials/test/red.mtrl")
    });
    actor.addComponent(ActorComponent).configure({
        player: !!isPlayer
    });
    actor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0, 0)
    });

    return actor;
};

ActorSystem.prototype.createGrid = function() {
    this.grid = this.em.createEntity();
    
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
            type: window.graphics.Float,
            count: 3
        }
    ];
    model.drawType = window.graphics.Lines;
    model.createBuffers();
    
    this.grid.addComponent(ModelComponent).configure({
        material: window.asset.get("materials/test/gray.mtrl"),
        model: model
    });
    this.grid.addComponent(TransformComponent).configure({});
};

ActorSystem.prototype.simulate = function() {
    for( var actors = this.actors, count = actors.length, i = 0; i < count; i++ )
    {
        var actor = actors[i];

        if(actor.entity)
        {
            var transform = actor.entity.transform;
            var input = actor.entity.input;
            var updated = false;
            
            if(input.mouse[1])
            {
                quat.rotateY(transform.rotation, transform.rotation, input.view[0] * -1);
                updated = true;
            }

            if(input.direction[0] !== 0 || input.direction[2] !== 0)
            {
                vec4.transformQuat(this.movement, input.direction, transform.rotation);
                vec4.scale(this.movement, this.movement, actor.moveSpeed);
                vec4.add(transform.position, transform.position, this.movement);
                updated = true;
            }

            if(updated) transform.update();

            if( actor.player )
            {
                this.updatePlayer(actor);
            }
        }
    }
};

ActorSystem.prototype.updatePlayer = function(player) {
    if( player.using && !player.entity.input.actions[0] )
    {
        player.using = false;
    }

    this.grabShape.calculateAABB(this.queryAABB, player.entity.transform.matrix);
    this.collision.broadphase.query(this.queryAABB, ColliderComponent.Flags.Useable, this.handlePlayerUsableQueryResult, this, player);
};

ActorSystem.prototype.handlePlayerUsableQueryResult = function(empty, collider, player) {
    if( empty )
    {
        this.item.stopActorTarget(player);

        if(player.holding && player.entity.input.actions[0] && !player.using)
        {
            this.item.startActorUse(player, player.holding);
            player.using = true;
        }

        return;
    }

    var item = collider.entity.components.item;

    if( item )
    {
        if(player.targeting === item)
        {
            if(player.entity.input.actions[0] && !player.using)
            {
                this.item.startActorUse(player, item);
                player.using = true;
            }

            return false;
        }

        this.item.stopActorTarget(player);
        this.item.startActorTarget(player, item);

        return false;
    }

    return true;
};

ColliderComponent.Flags.Character = ColliderComponent.addFlag();