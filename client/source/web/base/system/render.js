function RenderProcessor() {
    this.mvm = mat4.create();
    this.material = null;
}

RenderProcessor.prototype = new ProcessorPrototype();

RenderProcessor.prototype.update = function(dt) {
    var camera = CameraComponent.active;
    if( !camera ) return;

    var modelCount = ModelComponent.prototype.stack.length;
    for( var i = 0; i < modelCount; i++ )
    {
        var model = ModelComponent.prototype.stack[i];
        if( model.entity && model.material )
        {
            mat4.multiply(this.mvm, camera.ci, model.transform.matrix);

            var passCount = model.material.passes.length;
            for( var j = 0; j < passCount; j++ )
            {
                if( model.material.bind(j) )
                {                
                    if( window.gr.program.pm )
                    {
                        window.gr.gl.uniformMatrix4fv(window.gr.program.pm, false, camera.perspective);
                    }
                }

                if( window.gr.program.mvm )
                {
                    window.gr.gl.uniformMatrix4fv(window.gr.program.mvm, false, this.mvm);
                }

                window.gr.drawVertexBuffer(model.model.vertexBuffer, model.model.indexBuffer, window.gr.Triangles);
            }
        }
    }
};