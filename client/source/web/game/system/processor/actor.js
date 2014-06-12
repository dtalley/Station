function ActorProcessor(em, bp) {
    ProcessorPrototype.call(this);

    this.em = em; //Entity manager
    this.bp = bp; //Broadphase data structure

    this.movement = vec4.fromValues(0, 0, 0, 1);
    this.result = vec4.fromValues(0, 0, 0, 1);

    this.grabShape = new ColliderComponent.Sphere(0, 0, -1, 0, 0, -0.1, Math.PI / 2);
    this.deployShape = new ColliderComponent.Box(0, 0, -1, 0.5, 0.5, 0.5);

    this.queryAABB = new aabb();

    this.moveSpeed = window.app.step * 0.005;

    this.playerTransform = null;
    this.player = null;

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

ActorProcessor.prototype = new ProcessorPrototype();

ActorProcessor.prototype.process = function(actor) {
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
        vec4.scale(this.movement, this.movement, this.moveSpeed);
        vec4.add(transform.position, transform.position, this.movement);
        updated = true;
    }

    if(updated) transform.update();

    if( actor.player )
    {
        this.processPlayer(actor);
    }
};

ActorProcessor.prototype.processPlayer = function(player) {
    if( player.using )
    {
        if(!player.entity.input.actions[0])
        {
            player.using = false;
        }
    }

    var playerTransform = player.entity.transform;

    if( player.holding )
    {
        this.deployShape.calculateAABB(this.queryAABB, playerTransform.matrix);


        if( player.entity.input.actions[0] && !player.using )
        {
            var holdingTransform = player.holding.entity.transform;

            player.holding.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            vec4.transformQuat(holdingTransform.position, holdingTransform.position, playerTransform.rotation);
            vec3.add(holdingTransform.position, playerTransform.position, holdingTransform.position);
            quat.multiply(holdingTransform.rotation, playerTransform.rotation, holdingTransform.rotation);
            player.entity.transform.removeChild(holdingTransform);
            player.holding = null;
            player.using = true;
            this.cursor.model.visible = false;
            playerTransform.removeChild(this.cursor.transform);
        }
        else if( player.entity.input.mouse[0] && !player.using )
        {
            var holding = player.holding;

            if( holding.deployable )
            {
                this.emit("playerDeploy", player, player.holding.deployable);

                player.holding = null;
                player.using = true;
                this.cursor.model.visible = false;
                playerTransform.removeChild(this.cursor.transform);       
            }
        }
        else
        {
            return;
        }
    }

    this.player = player;

    this.grabShape.calculateAABB(this.queryAABB, playerTransform.matrix);
    this.bp.query(this.queryAABB, DynamicSystem.Usable, this.handlePlayerUsableQueryResult, this);
};

ActorProcessor.prototype.handlePlayerUsableQueryResult = function(collider, empty) {
    var player = this.player;

    if( empty )
    {
        if( player.targeting )
        {
            player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            player.targeting = null;
        }
        return;
    }

    var dynamic = collider.entity.getComponent(DynamicComponent);

    if( dynamic.deployable )
    {
        var dynamicTransform = dynamic.entity.transform;

        if(player.targeting === dynamic)
        {
            if(player.entity.input.actions[0] && !player.using)
            {
                player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
                player.targeting = null;       

                player.holding = dynamic;
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

        player.targeting = dynamic;
        player.targeting.entity.model.material = window.asset.get("materials/test/green.mtrl");

        return false;
    }

    return true;
};