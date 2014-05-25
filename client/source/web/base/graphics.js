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
    this.gl.attachShader(program, vertex);
    this.gl.attachShader(program, fragment);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.log("Could not link program.");
        return null;
    }

    return program;
};

GraphicsManager.prototype.createVertexBuffer = function(vertices, stride, count) {
    var buffer = this.gl.createBuffer();
    buffer.itemSize = stride;
    buffer.numItems = count;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, 0);
    return buffer;
};

GraphicsManager.prototype.drawVertexBuffer = function(buffer, type) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    switch(type)
    {
        case this.Triangles:
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.numItems);
            break;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, 0);
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
};

GraphicsManager.prototype.endFrame = function() {

};

//Shaders
GraphicsManager.prototype.FragmentShader = 0;
GraphicsManager.prototype.VertexShader = 1;

//Element types
GraphicsManager.prototype.Triangles = 0;