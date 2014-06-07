function DynamicProcessor(em) {
    this.em = em;

    this.dynamics = DynamicComponent.prototype.stack;

    this.movement = vec4.create();
    this.result = vec4.create();
    this.rq = quat.create();

    this.createGrid();

    for( var i = 0; i < 4; i++ )
    {
        var crate = this.em.createEntity();
        crate.addComponent(TransformComponent).configure({
            position: vec3.fromValues(4.5 + i, 0.5, 4.5),
            scale: vec3.fromValues(0.5, 0.5, 0.5)
        });
        crate.addComponent(ModelComponent).configure({
            model: window.asset.get("models/test/cube.oml"),
            material: window.asset.get("materials/test/gray.mtrl")
        });
        crate.addComponent(DynamicComponent).configure({
            deployable: true
        });
    }
}

DynamicProcessor.prototype = new ProcessorPrototype();

DynamicProcessor.prototype.update = function() {
    var dynamic;
    count = this.dynamics.length;
    for( i = 0; i < count; i++ )
    {
        dynamic = this.dynamics[i];
        if(!dynamic.entity) continue;

        if(dynamic.character)
        {
            this.updateCharacter(dynamic);
        }
    }
};

DynamicProcessor.prototype.updateCharacter = function(dynamic) {
    var input = dynamic.entity.input;
    var updated = false;
    
    if(input.mouse[1])
    {
        quat.rotateY(dynamic.entity.transform.rotation, dynamic.entity.transform.rotation, input.view[0] * -1);
        updated = true;
    }

    if(input.direction[0] !== 0 || input.direction[2] !== 0)
    {
        vec4.transformQuat(this.movement, input.direction, dynamic.entity.transform.rotation);
        vec4.scale(this.movement, this.movement, window.app.dt * 0.005);
        vec4.add(dynamic.entity.transform.position, dynamic.entity.transform.position, this.movement);
        updated = true;
    }

    if(updated) dynamic.entity.transform.update();

    if( dynamic.player )
    {
        this.updatePlayer(dynamic);
    }
};

DynamicProcessor.prototype.updatePlayer = function(player) {
    this.movement[0] = 0;
    this.movement[1] = 0;
    this.movement[2] = 1;
    this.movement[3] = 1;

    vec4.transformQuat(this.movement, this.movement, player.entity.transform.rotation);

    if( player.using )
    {
        if(!player.entity.input.actions[0])
        {
            player.using = false;
        }

        return;
    }
    if( player.holding )
    {
        if( player.entity.input.actions[0] )
        {
            player.holding.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            vec4.transformQuat(player.holding.entity.transform.position, player.holding.entity.transform.position, player.entity.transform.rotation);
            vec3.add(player.holding.entity.transform.position, player.entity.transform.position, player.holding.entity.transform.position);
            quat.multiply(player.holding.entity.transform.rotation, player.entity.transform.rotation, player.holding.entity.transform.rotation);
            player.entity.transform.removeChild(player.holding.entity.transform);
            player.holding = null;
            player.using = true;
        }
        else
        {
            return;
        }
    }

    var count = this.dynamics.length;
    for( var i = 0; i < count; i++ )
    {
        var dynamic = this.dynamics[i];

        if( dynamic.deployable )
        {
            var distance = vec3.distance(dynamic.entity.transform.position, player.entity.transform.position);
            if( distance < 1 )
            {
                vec3.subtract(this.result, dynamic.entity.transform.position, player.entity.transform.position);
                var dot = vec3.dot(this.result, this.movement);
                
                if( dot < 0 && ( 0 - dot ) > ( distance * 0.9 ) )
                {
                    if(player.targeting === dynamic)
                    {
                        if(player.entity.input.actions[0])
                        {
                            player.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
                            player.targeting = null;       

                            player.holding = dynamic;
                            player.holding.entity.model.material = window.asset.get("materials/test/blue.mtrl");

                            quat.invert(this.rq, player.entity.transform.rotation);
                            vec4.transformQuat(this.result, this.result, this.rq);
                            quat.multiply(dynamic.entity.transform.rotation, this.rq, dynamic.entity.transform.rotation);
                            dynamic.entity.transform.position[0] = this.result[0];
                            dynamic.entity.transform.position[1] = this.result[1];
                            dynamic.entity.transform.position[2] = this.result[2];
                            player.entity.transform.addChild(dynamic.entity.transform);

                            console.log(dynamic.entity.transform.position);

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

DynamicProcessor.prototype.createGrid = function() {
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