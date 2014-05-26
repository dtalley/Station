function RenderProcessor() {
    this.mvm = mat4.create();
}

RenderProcessor.prototype = new ProcessorPrototype();

RenderProcessor.prototype.update = function(dt) {
    var camera = CameraComponent.active;
    if( !camera ) return;

    camera.update();

    ModelComponent.prototype.stack.forEach(function(model){
        if( model.entity && model.material )
        {
            mat4.invert(this.mvm, camera.transform.matrix);
            model.transform.update();
            mat4.multiply(this.mvm, this.mvm, model.transform.matrix);

            model.material.passes.forEach(function(pass, i){
                model.material.bind(i);
                var program = window.gr.program;
                
                if( program.pm )
                {
                    window.gr.gl.uniformMatrix4fv(program.pm, false, camera.perspective);
                }

                if( program.mvm )
                {
                    window.gr.gl.uniformMatrix4fv(program.mvm, false, this.mvm);
                }

                window.gr.drawVertexBuffer(model.model.vertexBuffer, model.model.indexBuffer, window.gr.Triangles);
            }, this);
        }
    }, this);
};