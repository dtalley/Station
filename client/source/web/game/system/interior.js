function InteriorProcessor(em) {
    this.em = em;
    this.mv = vec3.create();

    this.containers = Interior.ContainerComponent.prototype.stack;
    this.dynamics = Interior.DynamicComponent.prototype.stack;
}

InteriorProcessor.prototype = new ProcessorPrototype();

InteriorProcessor.prototype.start = function(dt) {
    var dynamic;
    count = this.dynamics.length;
    for( i = 0; i < count; i++ )
    {
        dynamic = this.dynamics[i];
        if(!dynamic.entity) continue;

        if(dynamic.character)
        {
            var input = dynamic.entity.input;
            if( input.direction[0] || input.direction[1] )
            {
                vec3.set(this.mv, dt * 0.01 * input.direction[0], 0, dt * 0.01 * input.direction[1]);
                vec3.add(dynamic.entity.transform.position, dynamic.entity.transform.position, this.mv);
                dynamic.entity.transform.update();

                if(dynamic.player)
                {
                    if(dynamic.container)
                    {
                        this.generateChunks(dynamic);
                    }
                }
            }
        }
    }
};

InteriorProcessor.prototype.generateChunks = function(dynamic) {
    var tx = Math.floor(dynamic.entity.transform.position[0]);
    var ty = Math.floor(dynamic.entity.transform.position[2]);

    if( !dynamic.spawned || tx !== dynamic.tile[0] || ty !== dynamic.tile[1] )
    {
        dynamic.spawned = true;
        dynamic.tile[0] = tx;
        dynamic.tile[1] = ty;

        var cx = tx >> dynamic.container.shift;
        var cy = ty >> dynamic.container.shift;
        
        this.generateChunk(dynamic.container, cx, cy);
        this.generateChunk(dynamic.container, cx+1, cy);
        this.generateChunk(dynamic.container, cx, cy+1);
        this.generateChunk(dynamic.container, cx-1, cy);
        this.generateChunk(dynamic.container, cx, cy-1);
        this.generateChunk(dynamic.container, cx+1, cy+1);
        this.generateChunk(dynamic.container, cx-1, cy-1);
        this.generateChunk(dynamic.container, cx+1, cy-1);
        this.generateChunk(dynamic.container, cx-1, cy+1);
    }
};

InteriorProcessor.prototype.generateChunk = function(container, x, y) {
    if( x < 0 || x >= container.width || y < 0 || y >= container.height )
    {
        return;
    }

    var pos = x * container.height + y;
    var chunk = container.chunks[pos];
    if( chunk ) return;

    chunk = this.em.createEntity();
    container.chunks[pos] = chunk;
    chunk.addComponent(TransformComponent).configure({
        parent: container.entity.transform,
        position: vec3.set(this.mv, x*container.size, 0, y*container.size)
    });
    
    var size = container.size;
    var model = new ModelAsset();
    var verts = [];
    var idx = [];
    
    var total = container.size * container.size;
    for( var i = 0; i < total; i++ )
    {
        var col = Math.floor(i/container.size);
        var row = i % container.size;
        verts = verts.concat([
            col * 1.0, 0.0, row * 1.0,
            1.0, 0.0, 0.0,
            col * 1.0, 0.0, row * 1.0 + 1.0,
            0.0, 1.0, 0.0,
            col * 1.0 + 1.0, 0.0, row * 1.0 + 1.0,
            0.0, 0.0, 1.0,
            col * 1.0 + 1.0, 0.0, row * 1.0,
            1.0, 1.0, 1.0
        ]);
        var str = i * 4;
        idx = idx.concat([
            str, str + 1, str + 2,
            str + 2, str + 3, str
        ]);
    }
    
    model.vertices = new Float32Array(verts);
    model.indices = new Uint16Array(idx);
    model.attributes = [
        {
            name: "vertex",
            type: window.gr.Float,
            count: 3
        },
        {
            name: "color",
            type: window.gr.Float,
            count: 3
        }
    ];
    model.createBuffers();
    
    chunk.addComponent(ModelComponent).configure({
        material: window.asset.get("materials/test/green.mtrl"),
        model: model
    });
};