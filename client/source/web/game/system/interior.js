function InteriorProcessor(em) {
    this.em = em;
    this.mv = vec3.create();

    this.containers = Interior.ContainerComponent.prototype.stack;
    this.dynamics = Interior.DynamicComponent.prototype.stack;

    this.cursor = this.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        scale: vec3.fromValues(0.5, 0.5, 0.5),
        position: vec3.fromValues(0.5, 0.5, 0.5)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/test.oml"),
        material: window.asset.get("materials/test/blue.mtrl")
    });

    this.position = vec4.create();
    this.ray = vec4.create();
    this.ground = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
    this.origin = vec4.fromValues(0, 0, 0, 1.0);
}

InteriorProcessor.prototype = new ProcessorPrototype();

InteriorProcessor.prototype.start = function() {
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
                vec3.set(this.mv, window.app.step * 0.01 * input.direction[0], 0, window.app.step * 0.01 * input.direction[1]);
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

            if( input.driven && dynamic.player && CameraComponent.active )
            {
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
                var bottom = vec3.dot(this.position, this.ground);
                var top = vec3.dot(vec4.subtract(this.ray, this.origin, CameraComponent.active.position), this.ground);
                var d = top / bottom;

                vec4.add(this.position, CameraComponent.active.position, vec4.scale(this.position, this.position, d));

                this.cursor.transform.position[0] = Math.floor(this.position[0]) + 0.5;
                this.cursor.transform.position[2] = Math.floor(this.position[2]) + 0.5;
                this.cursor.transform.update();
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
        var xdist = Math.min(col, container.size-col);
        var ydist = Math.min(row, container.size-row);
        var dist = Math.min(xdist, ydist);
        var color = 1 - ( dist / ( container.size / 2 ) );
        var yper = row / container.size;
        verts = verts.concat([
            col * 1.0, 0.0, row * 1.0,
            color, 0.0, yper,
            col * 1.0, 0.0, row * 1.0 + 1.0,
            color, 0.0, yper,
            col * 1.0 + 1.0, 0.0, row * 1.0 + 1.0,
            color, 0.0, yper,
            col * 1.0 + 1.0, 0.0, row * 1.0,
            color, 0.0, yper
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
            name: "position",
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
        material: window.asset.get("materials/test/color.mtrl"),
        model: model
    });
};