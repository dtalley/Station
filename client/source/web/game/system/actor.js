function ActorSystem(bp) {
    this.actors = ActorComponent.prototype.stack;

    this.movement = vec4.fromValues(0, 0, 0, 1);
    this.result = vec4.fromValues(0, 0, 0, 1);

    this.bp = null;
}

ActorSystem.prototype = new SystemPrototype("actor", true, false);

ActorSystem.prototype.configure = function(em, bp) {
    this.em = em; //Entity manager
    this.bp = bp; //Broadphase data structure
};

ActorSystem.prototype.initialize = function() {
    this.grabShape = new ColliderComponent.Sphere(0, 0, -1, 0, 0, -0.1, Math.PI / 2);
    this.deployShape = new ColliderComponent.Box(0, 0, -1, 0.5, 0.5, 0.5);

    this.queryAABB = new aabb();

    this.cursor = this.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0.5, 0.5, 0.5)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/cube.oml"),
        material: window.asset.get("materials/test/green.mtrl"),
        visible: false
    });

    this.player = this.createActor(true);

    this.camera = this.em.createEntity();
    this.camera.addComponent(CameraComponent).activate();
    this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 40, 20),
        rotation: quat.rotateX(quat.create(), quat.zero, -63 * Math.PI / 180)
    });

    this.createGrid();

    for( var i = 0; i < 4; i++ )
    {
        var crate = this.em.createEntity();
        crate.addComponent(ColliderComponent).configure({
            shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
            flags: ActorSystem.Usable,
            broadphase: this.bp
        });
        crate.addComponent(ModelComponent).configure({
            model: window.asset.get("models/test/cube.oml"),
            material: window.asset.get("materials/test/gray.mtrl")
        });
        crate.addComponent(DeployableComponent);
        crate.addComponent(TransformComponent).configure({
            position: vec3.fromValues(4.5 + i, 0.5, 4.5),
            scale: vec3.fromValues(0.5, 0.5, 0.5)
        });
    }
};

ActorSystem.prototype.createActor = function(isPlayer) {
    var actor = this.em.createEntity();
    actor.addComponent(ColliderComponent).configure({
        shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
        flags: ActorSystem.Character,
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
        broadphase: this.bp,
        emitter: this.ee
    });
    actor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0.5, 0)
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
    if( player.using )
    {
        if(!player.entity.input.actions[0])
        {
            player.using = false;
        }
    }

    var transform = player.entity.transform;

    if( player.holding )
    {
        this.deployShape.calculateAABB(this.queryAABB, transform.matrix);
        this.bp.query(this.queryAABB, ActorSystem.Container, this.handlePlayerContainerQueryResult, this, player);

        if( player.entity.input.actions[0] && !player.using )
        {
            var holdingTransform = player.holding.entity.transform;

            player.holding.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            holdingTransform.detach();
            player.holding = null;
            player.using = true;
            this.cursor.model.visible = false;
            transform.removeChild(this.cursor.transform);
        }
        else if( player.entity.input.mouse[0] && !player.using )
        {
            this.handleDeploy(player.holding);

            player.holding = null;
            player.using = true;
            this.cursor.model.visible = false;
            transform.removeChild(this.cursor.transform);       
        }
        else
        {
            return;
        }
    }

    this.grabShape.calculateAABB(this.queryAABB, transform.matrix);
    this.bp.query(this.queryAABB, ActorSystem.Usable, this.handlePlayerUsableQueryResult, this, player);
};

ActorSystem.prototype.handlePlayerContainerQueryResult = function(empty, collider, player) {
    var transform = player.entity.transform, cursorTransform = this.cursor.transform;

    if( empty )
    {
        if( this.cursor.transform.parent !== transform )
        {
            transform.addChild(cursorTransform);
            cursorTransform.position[0] = 0;
            cursorTransform.position[1] = -0.375;
            cursorTransform.position[2] = -1;
        }
        return;
    }

    var colliderTransform = collider.entity.transform;

    if( cursorTransform.parent !== colliderTransform )
    {
        colliderTransform.addChild(cursorTransform);
    }
};

ActorSystem.prototype.handlePlayerUsableQueryResult = function(empty, collider, player) {
    console.log(empty);
    if( empty )
    {
        if( player.targeting )
        {
            player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            player.targeting = null;
        }
        return;
    }

    var deployable = collider.entity.getComponent(DeployableComponent);

    if( deployable )
    {
        var dynamicTransform = deployable.entity.transform;

        if(player.targeting === deployable)
        {
            if(player.entity.input.actions[0] && !player.using)
            {
                player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
                player.targeting = null;       

                player.holding = deployable;
                player.holding.entity.model.material = window.asset.get("materials/test/blue.mtrl");

                dynamicTransform.position[0] = 0;
                dynamicTransform.position[1] = 0;
                dynamicTransform.position[2] = -0.8;
                quat.identity(dynamicTransform.rotation, dynamicTransform.rotation);
                player.entity.transform.addChild(dynamicTransform);

                player.using = true;

                this.cursor.model.visible = true;
                player.entity.transform.addChild(this.cursor.transform);
                this.cursor.transform.position[0] = 0;
                this.cursor.transform.position[1] = -0.375;
                this.cursor.transform.position[2] = -1;
                this.cursor.transform.scale[0] = 1;
                this.cursor.transform.scale[1] = 0.25;
                this.cursor.transform.scale[2] = 1;
                this.cursor.transform.update();
            }

            return false;
        }
        else if(player.targeting)
        {
            player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            player.targeting = null;
        }

        player.targeting = deployable;
        player.targeting.entity.model.material = window.asset.get("materials/test/green.mtrl");

        return false;
    }

    return true;
};

ActorSystem.prototype.handleDeploy = function(deployable) {
    var entity = deployable.entity, transform = entity.transform;

    transform.scale[0] = 1;
    transform.scale[1] = 0.25;
    transform.scale[2] = 1;
    transform.detach();
    transform.position[1] = 0.125;
    transform.update();

    entity.removeComponent(DeployableComponent);
    entity.model.material = window.asset.get("materials/test/yellow.mtrl");
    entity.addComponent(ContainerComponent);
    entity.collider.flags ^= ActorSystem.Usable;
    entity.collider.flags ^= ActorSystem.Container;
};

ActorSystem.Character = ColliderComponent.addFlag();
ActorSystem.Usable = ColliderComponent.addFlag();
ActorSystem.Container = ColliderComponent.addFlag();