function RenderProcessor() {
    
}

RenderProcessor.prototype = new ProcessorPrototype();

RenderProcessor.prototype.update = function(dt) {
    ModelComponent.prototype.stack.forEach(function(model){
        if( model.entity )
        {
            if( model.material )
            {
                model.material.bind();
            }

            window.gr.drawVertexBuffer(model.model.vertexBuffer, window.gr.Triangles);
        }
    });
};