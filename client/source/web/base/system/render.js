function RenderSystem(sp) {
    SystemPrototype.call(this);

    this.sp = sp;
    
    this.camera = null;
}

RenderSystem.prototype = new SystemPrototype();

RenderSystem.prototype.update = function() {
    if(!window.gr.enabled)return;

    var modelCount = ModelComponent.prototype.stack.length;
    if(!modelCount)return;

    if(this.camera !== CameraComponent.active)
    {
        if(!CameraComponent.active) return;

        this.camera = CameraComponent.active;
        window.gr.updateMatrix(0, this.camera.perspective);
        window.gr.updateMatrix(1, this.camera.ci);
    } 
    else if(this.camera.isStale(this.camera.Channel1))
    {
        window.gr.updateMatrix(1, this.camera.ci);
    }
    
    for( var i = 0; i < modelCount; i++ )
    {
        var model = ModelComponent.prototype.stack[i];
        if( model.entity && model.material && model.model && model.visible )
        {
            var transform = model.entity.transform;
            var material = model.material;
            model = model.model;

            window.gr.newState();
            
            var position = window.gr.pushMatrix(transform.matrix);
            window.gr.pushMultiply(1, position);
            var passCount = material.passes.length;
            for( var j = 0; j < passCount; j++ )
            {
                window.gr.draw(model.vertexBuffer.id, model.indexBuffer.id, material.passes[j].program.id, j);
            }

            window.gr.popMatrix();
        }
    }
};