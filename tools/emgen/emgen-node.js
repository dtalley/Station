var bufferList = [];
var maxBufferSize = 128000;

function getBuffer() {
    if( bufferList.length == 0 )
    {
        return new Buffer(maxBufferSize);
    }
}

function returnBuffer(buffer) {
    bufferList.push(buffer);
}