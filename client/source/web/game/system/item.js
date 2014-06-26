function ItemSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.position = vec4.create();
    this.ray = vec4.create();
    this.ground = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
    this.origin = vec4.fromValues(0, 0, 0, 1.0);
    this.rotate = quat.create();
    this.result = 0.0;

    this.deploying = new ObjectRegistry();

    this.deployer = null;
}

ItemSystem.prototype = new SystemPrototype("item", true, false);

ItemSystem.prototype.configure = function() {
    
};

ItemSystem.prototype.initialize = function() {
    this.actor = this.sm.getSystem(ActorSystem);
    this.collision = this.sm.getSystem(CollisionSystem);
    this.container = this.sm.getSystem(ContainerSystem);

    this.deployShape = new ColliderComponent.Box(0, 0.375, 0, 0.5, 0.625, 0.5);
    this.queryAABB = new aabb();

    this.cursor = this.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0, 0)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/deploy.oml"),
        material: window.asset.get("materials/test/green.mtrl"),
        visible: false
    });

    this.items = window.asset.get("tables/temp/items.dtb");
    
    for( var i = 0; i < 4; i++ )
    {
        var crate = this.em.createEntity();
        crate.addComponent(ColliderComponent).configure({
            shape: new ColliderComponent.Box(0, 0, 0, 0.5, 0.5, 0.5),
            flags: ColliderComponent.Flags.Useable
        });
        crate.addComponent(ModelComponent).configure({
            model: window.asset.get("models/test/cube.oml"),
            material: window.asset.get("materials/test/gray.mtrl")
        });
        crate.addComponent(ItemComponent).configure({

        });
        crate.addComponent(TransformComponent).configure({
            position: vec3.fromValues(4.5 + i, 0.5, 4.5),
            scale: vec3.fromValues(0.5, 0.5, 0.5)
        });
    }
};

ItemSystem.prototype.simulate = function() {
    var count = this.deploying.length;
    for( var i = 0; i < count; i++ )
    {
        var item = this.deploying.array[i];
        if(item.owner && item.owner.using)
        {
            item.timer += window.app.step;
            if(item.timer >= 2000)
            {
                if(item.owner === this.deployer)
                {
                    this.cursor.model.visible = false;
                    this.deployer = null;
                }

                this.deployItem(item.owner, item, false);
                this.deploying.remove(item, i);
                i--;
                count--;
            }
        }
        else
        {
            this.deploying.remove(item, i);
            i--;
            count--;
        }
    }

    if(this.deployer && CameraComponent.active)
    {
        var input = this.deployer.entity.input;

        //Update cursor if necessary
        this.position[0] = input.pointer[0];
        this.position[1] = input.pointer[1];
        this.position[2] = 0;
        this.position[3] = 1;

        vec4.transformMat4(this.position, this.position, CameraComponent.active.revert);

        this.position[0] /= this.position[3];
        this.position[1] /= this.position[3];
        this.position[2] /= this.position[3];

        this.position[0] -= CameraComponent.active.position[0];
        this.position[1] -= CameraComponent.active.position[1];
        this.position[2] -= CameraComponent.active.position[2];
        this.position[3] = 1;

        //Do dot product, if it equals 0, the mouse didn't touch the ground plane

        //(p0-l0).n / l.n
        this.result = ( vec3.dot(vec4.subtract(this.ray, this.origin, CameraComponent.active.position), this.ground) ) / ( vec3.dot(this.position, this.ground) );

        var cursorTransform = this.cursor.transform;
        var actorTransform = this.deployer.entity.transform;

        vec4.add(cursorTransform.position, CameraComponent.active.position, vec4.scale(this.position, this.position, this.result));
        quat.identity(cursorTransform.rotation);
        actorTransform.rotateOther(cursorTransform);
        cursorTransform.update();

        this.deployShape.calculateAABB(this.queryAABB, cursorTransform.matrix);
        this.collision.broadphase.query(this.queryAABB, ColliderComponent.Flags.Floor, this.handleItemFloorQueryResult, this, this.deployer);
    }
};

ItemSystem.prototype.handleItemFloorQueryResult = function(empty, collider, deployer) {
    if(empty)
    {
        this.cursor.model.visible = false;
        return;
    }

    var chunkFloor = collider.entity.components.chunk_floor;
    if(chunkFloor)
    {
        var container = chunkFloor.container;
        vec3.subtract(this.position, this.cursor.transform.position, container.entity.transform.position);
        quat.invert(this.rotate, container.entity.transform.rotation);
        vec4.transformQuat(this.ray, this.position, this.rotate);
        this.ray[0] = Math.floor(this.ray[0]);
        this.ray[2] = Math.floor(this.ray[2]);
        vec4.transformQuat(this.ray, this.ray, container.entity.transform.rotation);
        vec4.add(this.cursor.transform.position, this.ray, container.entity.transform.position);
        quat.identity(this.cursor.transform.rotation);
        container.entity.transform.rotateOther(this.cursor.transform);
        this.cursor.transform.update();
        this.cursor.model.visible = true;
    }
};

ItemSystem.prototype.deployItem = function(actor, item, inContainer) {
    var itemEntity = item.entity, itemTransform = itemEntity.transform, actorTransform = actor.entity.transform;

    item.owner.holding = null;
    item.owner = null;

    this.container.createContainer(actorTransform);

    this.em.releaseEntity(itemEntity);
};

ItemSystem.prototype.startActorTarget = function(actor, item) {
    if( !actor.targeting )
    {
        actor.targeting = item;
        item.entity.model.material = window.asset.get("materials/test/green.mtrl");
    }
};

ItemSystem.prototype.stopActorTarget = function(actor) {
    if( actor.targeting )
    {
        var item = actor.targeting;
        actor.targeting = null;
        item.entity.model.material = window.asset.get("materials/test/gray.mtrl");
    }
};

ItemSystem.prototype.startActorUse = function(actor, item) {
    var itemTransform = item.entity.transform;

    if(actor.holding)
    {
        if(actor.holding === item)
        {
            if(!item.deploying)
            {
                item.deploying = true;
                item.timer = 0.0;
                this.deploying.add(item);
            }
        }
        else
        {

        }
    }
    else
    {
        if(item === actor.targeting)
        {
            actor.targeting = null;
        }

        actor.holding = item;
        item.owner = actor;

        if(actor.player)
        {
            this.deployer = actor;
        }

        itemTransform.position[0] = 0;
        itemTransform.position[1] = 0;
        itemTransform.position[2] = -0.8;
        quat.identity(itemTransform.rotation, itemTransform.rotation);
        actor.entity.transform.addChild(itemTransform);

        item.entity.model.material = window.asset.get("materials/test/blue.mtrl");
        item.entity.collider.removeFlags(ColliderComponent.Flags.Useable);
    }
    
};

ColliderComponent.Flags.Useable = ColliderComponent.addFlag();