function GraphicsManager() {
    this.canvas = document.getElementsByTagName("canvas")[0];
    this.gl = this.canvas.getContext("webgl");

    this.fragmentSource = "precision mediump float;\n\n" +
    "void main(void) {\n" +
        "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
    "}";

    this.vertexSource = "attribute vec3 aVertexPosition;\n\n" +
    "uniform mat4 uMVMatrix;\n" +
    "uniform mat4 uPMatrix;\n\n" +
    "void main(void) {\n" +
        "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
    "}";

    if( !this.gl )
    {
        throw new Error("Unable to get WebGL context.");
    }

    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.fragmentShader, this.fragmentSource);
    this.gl.compileShader(this.fragmentShader);

    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.vertexShader, this.vertexSource);
    this.gl.compileShader(this.vertexShader);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);

    this.program.vertexPositionAttribute = this.gl.getAttribLocation(this.program, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute);

    this.program.pMatrixUniform = this.gl.getUniformLocation(this.program, "uPMatrix");
    this.program.mvMatrixUniform = this.gl.getUniformLocation(this.program, "uMVMatrix");

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();

    this.vertices = new Float32Array([
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ]);
    this.buffer = this.gl.createBuffer();
    this.buffer.itemSize = 3;
    this.buffer.numItems = 3;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW);
}

GraphicsManager.prototype.resize = function(width, height) {
    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}

GraphicsManager.prototype.startFrame = function() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);

    mat4.identity(this.mvMatrix);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(this.program.vertexPositionAttribute, this.buffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, this.pMatrix);
    this.gl.uniformMatrix4fv(this.program.mvMatrixUniform, false, this.mvMatrix);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.numItems);
}

GraphicsManager.prototype.endFrame = function() {

}