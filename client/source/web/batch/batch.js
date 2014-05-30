function BatchState() {
    this.results = new StackPool();

    this.pooled = false;
}

function BatchDraw() {
    this.state = null;
    this.pooled = false;

    this.vertices = 0;
    this.indices = 0;
    this.program = 0;
    this.pass = 0;
}

function BatchManager() {
    this.process = this.process.bind(this);

    this.commandPool = new StackPool();
    this.commandQueue = new RingBuffer();
    this.commandSize = 1024 * 16;
    this.commandThreshold = this.commandSize - 256;

    this.writing = null;
    this.reading = null;
    this.writeOffset = 0;
    this.readOffset = 0;

    this.processed = 0;

    this.completeReceived = false;
    this.flushReceived = false;
    this.processingComplete = false;

    this.stateQueue = new RingBuffer();
    this.statePool = new StackPool();

    this.drawQueue = new RingBuffer();
    this.drawPool = new StackPool();

    this.matrixPool = new StackPool();
    this.matrixView = new Float32Array(16 * 16);
    this.matrixView.buffer.imbue();
    this.matrices = new Array(16);
    for( var i = 0; i < 16; i++ ) this.matrices[i] = new Float32Array(this.matrixView.buffer, 64 * i, 16);
    this.currentMatrix = 0;
}

BatchManager.prototype.getMatrix = function() {
    var matrix;
    if( this.matrixPool.top ) matrix = this.matrixPool.pop();
    else matrix = mat4.create();
    matrix.buffer.imbue();
    return matrix;
};

BatchManager.prototype.releaseMatrix = function(matrix) {
    this.matrixPool.push(matrix);
};

BatchManager.prototype.command = function(command) {
    this.commandQueue.push(command);
    
    if( this.commandQueue.span === 1 )
    {
        this.reading = command;
        this.process();
    }
};

BatchManager.prototype.process = function() {
    var id = 0;
    while(id != 0xFF)
    {
        id = this.reading.readUInt8(this.readOffset);
        this.readOffset += 1;

        if(id===0xFF)
        {
            this.commandPool.push(this.commandQueue.shift());
            this.reading = null;

            if(this.completeReceived)
            {
                this.processingComplete = true;
                return this.end(true);
            }
            else if(this.commandQueue.span>0) 
                this.reading = this.commandQueue.first;
            else
                throw new Error("Nothing to process!");

            if( this.reading ) this.readOffset = 0;
        }

        this.processed++;
        this.commands[id].apply(this);
    }
};

BatchManager.prototype.commandReference = {};

BatchManager.prototype.commandReference.newState = function() {
    if(this.statePool.top) 
        return this.stateQueue.push( this.state = this.statePool.pop() );

    return this.stateQueue.push( this.state = new BatchState() );
};

BatchManager.prototype.commandReference.pushMultiply = function() {
    if(!this.state) throw new Error("No state defined.");

    var a = this.reading.readUInt8(this.readOffset);
    var b = this.reading.readUInt8(this.readOffset+=1);
    this.readOffset += 1;

    var matrix = this.getMatrix();
    mat4.multiply(matrix, this.matrices[a], this.matrices[b]);
    this.state.results.push(matrix);
};

BatchManager.prototype.commandReference.pushMatrix = function() {
    var offset = this.currentMatrix++ * 64;
    for( var i = 0; i < 8; i++ ) this.matrixView.buffer.writeDoubleBE(this.reading.readDoubleBE(this.readOffset + ( i * 8 )), offset + (i * 8));
    this.readOffset += 64;
};

BatchManager.prototype.commandReference.popMatrix = function() {
    this.currentMatrix--;
};

BatchManager.prototype.commandReference.updateMatrix = function() {
    var offset = this.reading.readUInt16BE(this.readOffset) * 64;
    this.readOffset += 2;
    for( var i = 0; i < 8; i++ ) this.matrixView.buffer.writeDoubleBE(this.reading.readDoubleBE(this.readOffset + ( i * 8 )), offset + (i * 8));
    this.readOffset += 64;
};

BatchManager.prototype.commandReference.draw = function() {
    var draw;
    if(this.drawPool.top) draw = this.drawPool.pop();
    else draw = new BatchDraw();
    draw.vertices = this.reading.readUInt32BE(this.readOffset);
    draw.indices = this.reading.readUInt32BE(this.readOffset+=4);
    draw.program = this.reading.readUInt32BE(this.readOffset+=4);
    draw.pass = this.reading.readUInt8(this.readOffset+=4);
    draw.state = this.state;
    this.drawQueue.push(draw);
    this.readOffset += 1;
};

BatchManager.prototype.commandReference.complete = function() {
    this.completeReceived = true;
};

BatchManager.prototype.startCommand = function() {
    if(!this.writing)
    {
        if(this.commandPool.top>0) this.writing = this.commandPool.pop().imbue();
        else this.writing = new ArrayBuffer(1024 * 16).imbue();
    }
    else if( this.writeOffset > this.commandThreshold )
    {
        this.flushCommand();
        return this.startCommand();
    }
};

BatchManager.prototype.flushCommand = function() {
    this.writing.writeUInt8(0xFF, this.writeOffset);
    this.writing.discard();
    self.postMessage(this.writing, [this.writing]);
    this.writing = null;
    this.writeOffset = 0;
};

BatchManager.prototype.flush = function() {
    while(this.drawQueue.span)
    {
        var draw = this.drawQueue.shift();

        this.startCommand();
        this.writing.writeUInt32BE(draw.vertices, this.writeOffset);
        this.writing.writeUInt32BE(draw.indices, this.writeOffset+=4);
        this.writing.writeUInt32BE(draw.program, this.writeOffset+=4);
        this.writeOffset += 4;

        var resultCount = draw.state.results.top;
        this.writing.writeUInt8(resultCount, this.writeOffset);
        this.writeOffset += 1;

        for( var i = 0; i < resultCount; i++ )
        {
            for( var j = 0; j < 8; j++ ) this.writing.writeDoubleBE(draw.state.results[i].buffer.readDoubleBE(j * 8), this.writeOffset + (j * 8));
            this.writeOffset += 64;
        }

        this.drawPool.push(draw);
    }

    if(this.writing)
    {
        this.flushCommand();
    }

    while(this.stateQueue.span) 
    {
        var state = this.stateQueue.shift();
        while(state.results.top) this.matrixPool.push(state.results.pop());

        this.statePool.push(state);
    }

    while(this.commandPool.top)
    {
        var command = this.commandPool.pop();
        command.writeUInt8(0xFF, 0);
        command.discard();
        self.postMessage(command, [command]);
        command = null;
    }
};

BatchManager.prototype.end = function(internal) {
    if( !this.flushReceived && !internal )
    {
        this.flushReceived = true;

        if(this.commandQueue.span === 0)
        {
            this.processingComplete = true;
        }
    }

    if(this.processingComplete && this.flushReceived)
    {
        this.flushReceived = false;
        this.completeReceived = false;
        this.processingComplete = false;

        this.readOffset = 0;

        this.processed = 0;

        this.flush();

        setTimeout(self.postMessage, 0);
    }
};

BatchManager.prototype.commands = [
    BatchManager.prototype.commandReference.newState,
    BatchManager.prototype.commandReference.pushMultiply,
    BatchManager.prototype.commandReference.popMultiply,
    BatchManager.prototype.commandReference.pushMatrix,
    BatchManager.prototype.commandReference.popMatrix,
    BatchManager.prototype.commandReference.updateMatrix,
    BatchManager.prototype.commandReference.draw,
    BatchManager.prototype.commandReference.complete
];

var manager = new BatchManager();

self.onmessage = function(message) {
    if( !message.data )
    {
        manager.end(false);
    }
    else if( message.data.byteLength)
    {
        manager.command(message.data.imbue());
    }
};