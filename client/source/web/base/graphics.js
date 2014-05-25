function GraphicsManager() {
    this.canvas = document.getElementsByTagName("canvas")[0];
    this.gl = this.canvas.getContext("webgl");

    if( !this.gl )
    {
        throw new Error("Unable to get WebGL context.");
    }
}

GraphicsManager.prototype.createShader = function(source, type) {
    var shader;
    switch(type)
    {
        case this.FragmentShader:
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            break;

        case this.VertexShader:
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            break;

        default:
            throw new Error("Invalid shader type provided: " + type);
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log("Shader Compilation Error", this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

GraphicsManager.prototype.createProgram = function(vertex, fragment) {
    var program = this.gl.createProgram();
    this.gl.attachShader(program, vertex.shader);
    this.gl.attachShader(program, fragment.shader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.log("Could not link program.");
        return null;
    }
    
    var key;

    for( key in vertex.attributes )
    {
        program[key] = this.gl.getAttribLocation(program, vertex.attributes[key]);
        this.gl.enableVertexAttribArray(program[key]);
    }

    var uniforms = {};
    for( key in vertex.uniforms )
    {
        if( fragment.uniforms[key] !== undefined && fragment.uniforms[key] != vertex.uniforms[key] )
        {
            throw new Error("Uniform in fragment shader overwritten by uniform in vertex shader.");
        }
        
        program[key] = this.gl.getUniformLocation(program, vertex.uniforms[key]);
        uniforms[key] = true;
    }

    for( key in fragment.uniforms )
    {
        if(uniforms[key])
            continue;

        program[key] = this.gl.getUniformLocation(program, fragment.uniforms[key]);
    }

    return program;
};

GraphicsManager.prototype.useProgram = function(program) {
    if( !program )
    {
        this.program = null;
        this.gl.useProgram(null);
        return;
    }

    this.program = program.program;
    this.gl.useProgram(this.program);
};

GraphicsManager.prototype.createVertexBuffer = function(vertices, stride, count) {
    var buffer = this.gl.createBuffer();
    buffer.stride = stride;
    buffer.count = count;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return buffer;
};

GraphicsManager.prototype.drawVertexBuffer = function(buffer, type) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    if( this.program )
    {
        if( this.program.vpos !== undefined )
        {
            this.gl.vertexAttribPointer(this.program.vpos, buffer.stride, this.gl.FLOAT, false, 0, 0);
        }
    }
    
    switch(type)
    {
        case this.Triangles:
            this.gl.drawArrays(this.gl.TRIANGLES, 0, buffer.count);
            break;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
};

GraphicsManager.prototype.resize = function(width, height) {
    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.width = width;
    this.height = height;
};

GraphicsManager.prototype.startFrame = function() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);

    this.useProgram(null);
};

GraphicsManager.prototype.endFrame = function() {

};

//Shaders
GraphicsManager.prototype.FragmentShader = 0;
GraphicsManager.prototype.VertexShader = 1;

//Element types
GraphicsManager.prototype.Triangles = 0;