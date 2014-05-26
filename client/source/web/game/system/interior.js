function InteriorProcessor(em) {
    this.em = em;
    this.mv = vec3.create();

    this.containers = Interior.ContainerComponent.prototype.stack;
    this.dynamics = Interior.DynamicComponent.prototype.stack;
}

InteriorProcessor.prototype = new ProcessorPrototype();

InteriorProcessor.prototype.update = function(dt) {
    var dynamic;
    var count = this.dynamics.length;
    for( var i = 0; i < count; i++ )
    {
        dynamic = this.dynamics[i];
        if(!dynamic.entity) continue;

        if(dynamic.character)
        {
            var input = dynamic.entity.input;
            if( input.direction[0] || input.direction[1] )
            {
                if( !dynamic.moved )
                {
                    dynamic.moved = true;
                    vec3.set(this.mv, 2.0 * input.direction[0], 0, 2.0 * input.direction[1]);
                    vec3.add(dynamic.entity.transform.position, dynamic.entity.transform.position, this.mv);
                    if( dynamic.entity.camera )
                    {
                        dynamic.entity.camera.update();
                    }
                    else
                    {
                        dynamic.entity.transform.update();
                    }
                }
            }
            else
            {
                dynamic.moved = false;
            }
        }
    }
};