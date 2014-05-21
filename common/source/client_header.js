ArrayBuffer.prototype.copy = function(target, targetOffset, sourceOffset, length)
{
    var newLength = Math.floor(length / 8);

    var sourceView = new Float64Array(this, sourceOffset, newLength);
    var targetView = new Float64Array(target, targetOffset, newLength);
    var overLength = length % 8;
    
    for(var i = 0; i < newLength; targetView[i] = sourceView[i], i++, sourceOffset += 8, targetOffset += 8){}

    sourceView = new Uint8Array(this, sourceOffset, overLength);
    targetView = new Uint8Array(target, targetOffset, overLength);

    for(var i = 0; i < overLength; targetView[i] = sourceView[i], i++){}
};

Object.defineProperty(ArrayBuffer.prototype, "length", {
    get: function() {return this.byteLength;},
    set: function(y) {}
});

ArrayBuffer.prototype.imbue = function() {
    this.byteArray = new Uint8Array(this, 0, this.byteLength);
};

ArrayBuffer.prototype.readUInt8 = function(offset) {
    return this.byteArray[offset];
};

ArrayBuffer.prototype.readUInt16BE = function(offset) {
    return ((this.byteArray[offset+2] << 8) >>> 0)
         + this.byteArray[offset+3];
};

ArrayBuffer.prototype.readUInt32BE = function(offset) {
    return ((this.byteArray[offset] << 24) >>> 0)
         + (this.byteArray[offset+1] << 16) 
         + (this.byteArray[offset+2] << 8) 
         + this.byteArray[offset+3];
};

ArrayBuffer.prototype.readInt8 = function(offset) {
    return this.byteArray[offset];
};

ArrayBuffer.prototype.readInt16BE = function(offset) {
    return ((this.byteArray[offset+2] << 8) >>> 0)
         + this.byteArray[offset+3];
};

ArrayBuffer.prototype.readInt32BE = function(offset) {
    return ((this.byteArray[offset] << 24) >>> 0)
         + (this.byteArray[offset+1] << 16) 
         + (this.byteArray[offset+2] << 8) 
         + this.byteArray[offset+3];
};

