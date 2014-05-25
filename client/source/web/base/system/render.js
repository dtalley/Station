function RenderProcessor() {
    
}

RenderProcessor.prototype = new ProcessorPrototype();

RenderProcessor.prototype.update = function(dt) {
    ModelComponent.prototype.stack.forEach(function(model){
        if( model.entity && model.material )
        {
            model.material.passes.forEach(function(pass, i){
                model.material.bind(i);

                window.gr.drawVertexBuffer(model.model.vertexBuffer, window.gr.Triangles);
            });
        }
    });
};