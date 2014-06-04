function InteriorProcessor(em) {
    this.em = em;

    this.containers = Interior.ContainerComponent.prototype.stack;
    this.dynamics = Interior.DynamicComponent.prototype.stack;

    this.movement = vec4.create();

    this.grid = this.em.createEntity();
    this.grid.addComponent(TransformComponent).configure({
        
    });
    
    var model = new ModelAsset();
    var verts = [];
    var idx = [];

    var span = 64;
    var size = span * span;
    var half = span >> 2;

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
            str + 1, str + 2, str + 3
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
        }
    }
};