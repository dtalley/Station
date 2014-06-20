function ItemSystem(sm, em) {
    this.sm = sm;
    this.em = em;
}

ItemSystem.prototype = new SystemPrototype("item", false, false);

ItemSystem.prototype.configure = function() {
    
};

ItemSystem.prototype.initialize = function() {
    this.actor = this.sm.getSystem(ActorSystem);
    this.collision = this.sm.getSystem(CollisionSystem);

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
            item.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            itemTransform.orphan();
            actor.holding = null;
            item.entity.collider.addFlags(ColliderComponent.Flags.Useable);
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