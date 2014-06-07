quat.zero = quat.identity(quat.create());

function GraphicsManager(finishCallback) {
    this.onBatchMessage = this.onBatchMessage.bind(this);

    this.commandSize = 1024 * 16;
    this.commandThreshold = this.commandSize - 256;

    this.commandPool = new StackPool();
    this.commandQueue = new RingBuffer();

    this.writing = null;
    this.reading = null;
    this.writeOffset = 0;
    this.readOffset = 0;

    this.uniformIndex = [];
    this.uniformReference = {};

    this.finishCallback = finishCallback;

    this.buffers = [];
    this.programs = [];

    this.canvas = document.getElementsByTagName("canvas")[0];
    this.gl = this.canvas.getContext("webgl", {alpha:false});

    if( !this.gl )
    {
        throw new Error("Unable to get WebGL context.");
    }

    //this.glext_ft = this.gl.getExtension("GLI_frame_terminator");
    this.ps = false;

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    //this.gl.enable(this.gl.CULL_FACE);
    //this.gl.cullFace(this.gl.BACK);
    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.batch = new window.Worker("batch.js");
    this.batch.addEventListener("message", this.onBatchMessage, false);

    this.currentStore = 2;
    this.currentResult = 0;

    this.callsReceived = 0;
    this.callsSent = 0;

    this.uniforms = new Array(this.GlobalUniformCount);

    this.stored = [];

    this.enabled = true;

    this.mvm = mat4.create();
    this.mvm.buffer.imbue();

    this.batchStarted = false;
    this.batchEnded = false;
    this.frameEnded = false;
    this.processingComplete = false;
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
    
    program.attributes = [];
    vertex.attributes.forEach(function(attribute,i){
        var key = attribute[0];
        var attr = {
            key: key,
            id: this.gl.getAttribLocation(program, attribute[1])
        };
        program[key] = attr.id;
        program.attributes.push(attr);
    }, this);

    program.uniforms = [];
    vertex.uniforms.forEach(function(uniform,i){
        var key = uniform[0];

        program[key] = this.gl.getUniformLocation(program, uniform[1]);
        program.uniforms.push(program[key]);
    }, this);

    vertex.uniforms.forEach(function(uniform,i){
        var key = uniform[0];
        if(program[key])
            return;

        program[key] = this.gl.getUniformLocation(program, uniform[1]);
        program.uniforms.push(program[key]);
    }, this);

    this.programs.push(program);
    program.id = this.programs.length-1;

    return program;
};

GraphicsManager.prototype.useProgram = function(program) {
    if( program === this.program )
    {
        return;
    }

    if(this.program)
    {
        var count = this.program.attributes.length;
        for( var i = 0; i < count; i++ )
        {
            this.gl.disableVertexAttribArray(this.program.attributes[i].id);
        }
    }

    if( !program )
    {
        this.program = null;
        this.gl.useProgram(null);
        return;
    }

    this.ps = true;

    this.program = program;
    this.gl.useProgram(this.program);
};

GraphicsManager.prototype.createVertexBuffer = function(vertices, attributes) {
    var buffer = this.gl.createBuffer();
    buffer.attributes = [];
    var offset = 0;
    var count = attributes.length;
    for( var i = 0; i < count; i++ )
    {
        var attribute = attributes[i];
        var type = this.gl.FLOAT;
        var size = 4;
        switch(attribute.type)
        {
            case this.Float:
            case "Float":
                type = this.gl.FLOAT;
                size = 4;
                break;

            case this.Double:
            case "Double":
                type = this.gl.DOUBLE;
                size = 8;
                break;

            case this.Short:
            case "Short":
                type = this.gl.UNSIGNED_SHORT;
                size = 4;
                break;
        }
        buffer[attribute.name] = {
            name: attribute.name,
            size: size,
            offset: offset,
            count: attribute.count,
            type: type,
            normalized: attribute.normalized || false
        };
        offset += size * attribute.count;
    }
    buffer.stride = offset;
    buffer.count = vertices.length / buffer.stride;
    this.vb = null;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.buffers.push(buffer);
    buffer.id = this.buffers.length-1;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return buffer;
};

GraphicsManager.prototype.createIndexBuffer = function(indices, type) {
    var buffer = this.gl.createBuffer();
    buffer.count = indices.length;
    switch(type)
    {
        case this.Triangles:
            buffer.type = this.gl.TRIANGLES;
            break;

        case this.LineStrip:
            buffer.type = this.gl.LINE_STRIP;
            break;

        case this.Lines:
            buffer.type = this.gl.LINES;
            break;

        case this.Points:
            buffer.type = this.gl.POINTS;
            break;
    }
    this.ib = null;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    this.buffers.push(buffer);
    buffer.id = this.buffers.length-1;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    return buffer;
};

GraphicsManager.prototype.drawVertexBuffer = function(vertexBuffer, indexBuffer) {
    if( !this.program )
    {
        return;
    }

    if( this.vb !== vertexBuffer )
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.vb = vertexBuffer;
    }

    var count = this.program.attributes.length;
    for( var i = 0; i < count; i++ )
    {
        var match = this.program.attributes[i];
        var attribute = vertexBuffer[match.key];
        if(!attribute) continue;
        this.gl.enableVertexAttribArray(match.id);
        this.gl.vertexAttribPointer(match.id, attribute.count, attribute.type, attribute.normalized, vertexBuffer.stride, attribute.offset);
    }

    if( indexBuffer && this.ib !== indexBuffer )
    {
        this.ib = indexBuffer;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    }
    
    if( indexBuffer )
    {
        this.gl.drawElements(indexBuffer.type, indexBuffer.count, this.gl.UNSIGNED_SHORT, 0);
    }
    else
    {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexBuffer.count);
    }
};

GraphicsManager.prototype.resize = function(width, height) {
    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.width = width;
    this.height = height;
};

GraphicsManager.prototype.onBatchMessage = function(event) {
    if( !event.data )
    {
        //console.timeEnd("onk_batch");
        this.batchEnded = true;
        this.finish(true);        
    }
    else if( event.data.byteLength )
    {
        this.commandQueue.push(event.data.imbue());
    }
};

GraphicsManager.prototype.process = function() {
    if( !this.batchStarted )
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
        this.useProgram(null);
        this.batchStarted = true;
    }

    while(true)
    {
        var test = this.reading.readUInt8(this.readOffset);

        if( test !== 0xFF )
        {
            var vertices = this.reading.readUInt32BE(this.readOffset);
            var indices = this.reading.readUInt32BE(this.readOffset+=4);
            var program = this.reading.readUInt32BE(this.readOffset+=4);
            var resultCount = this.reading.readUInt8(this.readOffset+=4);
            this.readOffset += 1;

            for( var j = 0; j < resultCount; j++ )
            {
                if( j === 0 )
                {
                    for( var i = 0; i < 8; i++ ) this.mvm.buffer.writeDoubleBE(this.reading.readDoubleBE(this.readOffset + ( i * 8 )), i * 8);
                }
                this.readOffset += 64;
            }

            var vb = null;
            if(vertices < this.buffers.length)
                vb = this.buffers[vertices];

            var ib = null;
            if(indices < this.buffers.length)
                ib = this.buffers[indices];

            var pr = null;
            if(program < this.programs.length)
                pr = this.programs[program];

            if(!vb || !pr) throw new Error("Invalid draw command received.");

            this.useProgram(pr);

            this.gl.uniformMatrix4fv(pr.uniforms[0], false, CameraComponent.active.perspective);
            this.gl.uniformMatrix4fv(pr.uniforms[1], false, this.mvm);

            this.drawVertexBuffer(vb, ib);

            this.callsReceived++;

            continue;
        }
        
        this.commandPool.push(this.commandQueue.shift());
        this.reading = null;

        if( this.commandQueue.span > 0 )
        {
            this.reading = this.commandQueue.first;
            this.readOffset = 0;
        }
        else
        {
            //console.timeEnd("onk_draw");
            this.processingComplete = true;
            this.finish(true);
            break;
        }
    }
};

GraphicsManager.prototype.startCommand = function(type) {
    if(!this.writing)
    {
        if(this.commandPool.top>0) this.writing = this.commandPool.pop().imbue();
        else this.writing = new ArrayBuffer(1024 * 16).imbue();
        this.writeOffset = 0;
    }
    else if( this.writeOffset > this.commandThreshold )
    {
        this.flushCommand();
        return this.startCommand(type);
    }

    this.writing.writeUInt8(type, this.writeOffset);
    this.writeOffset += 1;
};

GraphicsManager.prototype.flushCommand = function() {
    this.writing.writeUInt8(0xFF, this.writeOffset);
    this.batch.postMessage(this.writing, [this.writing]);
    this.writing = null;
};

GraphicsManager.prototype.newState = function() {
    this.startCommand(this.BatchNewState);
    this.currentResult = 0;
};

GraphicsManager.prototype.pushMatrix = function(matrix) {
    this.startCommand(this.BatchPushMatrix);
    matrix.buffer.imbue().copy(this.writing, this.writeOffset, 0);
    this.writeOffset += 64;
    return this.currentStore++;
};

GraphicsManager.prototype.popMatrix = function() {
    this.startCommand(this.BatchPopMatrix);
    this.currentStore--;
};

GraphicsManager.prototype.updateMatrix = function(position, matrix) {
    this.startCommand(this.BatchUpdateMatrix);
    this.writing.writeUInt16BE(position, this.writeOffset);
    matrix.buffer.imbue().copy(this.writing, this.writeOffset += 2, 0);
    this.writeOffset += 64;
};

GraphicsManager.prototype.pushMultiply = function(a, b) {
    this.startCommand(this.BatchPushMultiply);
    this.writing.writeUInt8(a, this.writeOffset);
    this.writing.writeUInt8(b, this.writeOffset += 1);
    this.writeOffset += 1;
    return this.currentResult++;
};

GraphicsManager.prototype.draw = function(vertices, indices, program, order) {
    this.startCommand(this.BatchDraw);
    this.writing.writeUInt32BE(vertices, this.writeOffset);
    this.writing.writeUInt32BE(indices!==undefined?indices:-1, this.writeOffset += 4);
    this.writing.writeUInt32BE(program, this.writeOffset += 4);
    this.writing.writeUInt8(order, this.writeOffset += 4);
    this.writeOffset += 1;
    this.callsSent++;
};

GraphicsManager.prototype.startFrame = function() {
    this.currentStore = 0;
    this.currentCommand = 0;
};

GraphicsManager.prototype.endFrame = function() {
    //if (this.glext_ft) {
        //this.glext_ft.frameTerminator();
    //}

    if(this.writing)
    {
        this.startCommand(this.BatchComplete);
        this.flushCommand();
    }

    this.batch.postMessage();

    //console.time("onk_batch");
    //console.time("onk_draw");

    if( this.commandQueue.span > 0 )
    {
        this.reading = this.commandQueue.first;
        this.readOffset = 0;
        this.process();
    }
    else
    {
        this.processingComplete = true;
    }

    this.finish(false);
};

GraphicsManager.prototype.finish = function(internal) {
    if(!this.frameEnded && !internal)
    {
        this.frameEnded = true;
    }

    if(this.frameEnded && this.processingComplete && this.batchEnded)
    {
        this.batchEnded = false;
        this.frameEnded = false;
        this.processingComplete = false;
        this.batchStarted = false;

        this.callsReceived = 0;
        this.callsSent = 0;

        if(this.finishCallback)this.finishCallback();
    }
};

//Batch operations
GraphicsManager.prototype.BatchNewState = 0;
GraphicsManager.prototype.BatchPushMultiply = 1;
GraphicsManager.prototype.BatchPopMultiply = 2;
GraphicsManager.prototype.BatchPushMatrix = 3;
GraphicsManager.prototype.BatchPopMatrix = 4;
GraphicsManager.prototype.BatchUpdateMatrix = 5;
GraphicsManager.prototype.BatchDraw = 6;
GraphicsManager.prototype.BatchComplete = 7;

//Batch operand types
GraphicsManager.prototype.StoredMatrix = 0;
GraphicsManager.prototype.TargetMatrix = 1;

//Batch result types
GraphicsManager.prototype.UniformMatrix = 0;

//Shaders
GraphicsManager.prototype.FragmentShader = 0;
GraphicsManager.prototype.VertexShader = 1;

//Element types
GraphicsManager.prototype.Triangles = 0;
GraphicsManager.prototype.LineStrip = 1;
GraphicsManager.prototype.Lines = 2;
GraphicsManager.prototype.Points = 3;
GraphicsManager.prototype.LineLoop = 4;
GraphicsManager.prototype.TriangleStrip = 5;
GraphicsManager.prototype.TriangleFan = 6;

//Number types
GraphicsManager.prototype.Double = [8];
GraphicsManager.prototype.Float = [4];
GraphicsManager.prototype.Long = [8];
GraphicsManager.prototype.Integer = [4];
GraphicsManager.prototype.Short = [2];
GraphicsManager.prototype.Byte = [1];

GraphicsManager.prototype.Perspective = 0;
GraphicsManager.prototype.GlobalUniformCount = 1;