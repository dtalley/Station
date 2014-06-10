function ActorProcessor(sp) {
    ProcessorPrototype.call(this);

    this.sp = sp; //Spatial partitioner

    this.movement = vec4.fromValues(0, 0, 0, 1);
    this.grabShape = new ColliderComponent.Sphere(0, 0, -0.5, 0, 0, -0.5, Math.PI / 2);
    this.grabAABB = new aabb();

    this.moveSpeed = window.app.step * 0.005;
}

ActorProcessor.prototype = new ProcessorPrototype();

ActorProcessor.prototype.process = function() {
    for( var i = 0; i < this.components.length; i++ )
    {
        var dynamic = this.components.array[i];
        var transform = dynamic.entity.transform;
        var input = dynamic.entity.input;
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

        if( dynamic.player )
        {
            this.processPlayer(dynamic);
        }
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
        }
        else
        {
            return;
        }
    }

    this.grabShape.calculateAABB(this.grabAABB, playerTransform.matrix);
    this.sp.query(this.grabAABB);
    var count = this.sp.results.length;
    for( var i = 0; i < count; i++ )
    {
        //console.log("Query result", i);
    }

    return;
    var count = this.dynamics.length;
    for( var i = 0; i < count; i++ )
    {
        var dynamic = this.dynamics[i];

        if( dynamic.deployable )
        {
            var dynamicTransform = dynamic.entity.transform;

            var distance = vec3.distance(dynamicTransform.position, playerTransform.position);
            if( distance < 1 )
            {
                playerTransform.rotateUnitVector4(this.movement);

                vec3.subtract(this.result, dynamicTransform.position, playerTransform.position);
                var dot = vec3.dot(this.result, this.movement);
                
                if( dot < 0 && ( 0 - dot ) > ( distance * 0.9 ) )
                {
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
                            playerTransform.addChild(dynamicTransform);

                            player.using = true;
                        }

                        return;
                    }
                    else if(player.targeting)
                    {
                        player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
                        player.targeting = null;
                    }

                    player.targeting = dynamic;
                    player.targeting.entity.model.material = window.asset.get("materials/test/green.mtrl");
                    return;
                }
            }
        }
    }

    if(player.targeting)
    {
        player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
        player.targeting = null;
    }
};