function RenderSystem(sp) {
    this.models = ModelComponent.prototype.stack;
    
    this.camera = null;
    this.bp = null;
}

RenderSystem.prototype = new SystemPrototype("render", false, true);

RenderSystem.prototype.configure = function(bp) {
    this.bp = bp;
};

RenderSystem.prototype.initialize = function() {

};

RenderSystem.prototype.render = function() {
    var graphics = window.graphics;
    if(!graphics.enabled)return;

    var models = this.models;
    var modelCount = models.length;
    if(!modelCount)return;

    if(this.camera !== CameraComponent.active)
    {
        if(!CameraComponent.active) return;

        this.camera = CameraComponent.active;
        graphics.updateMatrix(0, this.camera.perspective);
        graphics.updateMatrix(1, this.camera.ci);
    } 
    else if(this.camera.isStale(this.camera.Channel1))
    {
        graphics.updateMatrix(1, this.camera.ci);
    }
    
    for( var i = 0; i < modelCount; i++ )
    {
        var model = models[i];
        if( model.entity && model.material && model.model && model.visible )
        {
            var transform = model.entity.transform;
            var material = model.material;
            model = model.model;

            graphics.newState();
            
            var position = graphics.pushMatrix(transform.matrix);
            graphics.pushMultiply(1, position);
            var passCount = material.passes.length;
            for( var j = 0; j < passCount; j++ )
            {
                graphics.draw(model.vertexBuffer.id, model.indexBuffer.id, material.passes[j].program.id, j);
            }

            graphics.popMatrix();
        }
    }
};