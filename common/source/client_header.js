ArrayBuffer.prototype.copy = function(target, targetOffset, sourceOffset, length)
{
    target.a.set(this.a, targetOffset);
};

Object.defineProperty(ArrayBuffer.prototype, "length", {
    get: function() {return this.byteLength;},
    set: function(y) {}
});

ArrayBuffer.prototype.cb = new ArrayBuffer(8);
ArrayBuffer.prototype.cu8 = new Uint8Array(ArrayBuffer.prototype.cb, 0, 8);
ArrayBuffer.prototype.cu16 = new Uint16Array(ArrayBuffer.prototype.cb, 0, 1);
ArrayBuffer.prototype.cf32 = new Float32Array(ArrayBuffer.prototype.cb, 0, 1);
ArrayBuffer.prototype.cf64 = new Float64Array(ArrayBuffer.prototype.cb, 0, 1);

ArrayBuffer.prototype.imbue = function() {
    this.a = new Uint8Array(this, 0, this.byteLength);
    this.b = new Int8Array(this, 0, this.byteLength);

    return this;
};

ArrayBuffer.prototype.readUInt8 = function(offset) {
    return this.a[offset];
};

ArrayBuffer.prototype.readUInt16BE = function(offset) {
    return ((this.a[offset] << 8) >>> 0)
         + this.a[offset+1];
};

ArrayBuffer.prototype.readUInt32BE = function(offset) {
    return ((this.a[offset] << 24) >>> 0)
         + (this.a[offset+1] << 16) 
         + (this.a[offset+2] << 8) 
         + this.a[offset+3];
};

ArrayBuffer.prototype.readInt8 = function(offset) {
    return this.b[offset];
};

ArrayBuffer.prototype.readInt16BE = function(offset) {
    return ((this.b[offset] << 8) >>> 0)
         | this.a[offset+1];
};

ArrayBuffer.prototype.readInt32BE = function(offset) {
    return ((this.a[offset] << 24) >>> 0)
         | (this.a[offset+1] << 16) 
         | (this.a[offset+2] << 8) 
         | this.a[offset+3];
};

ArrayBuffer.prototype.readFloatBE = function(offset) {
    for(var i = 0; i < 4; this.cu8[i] = this.a[offset+3-i], i++);
    return this.cf32[0];
};

ArrayBuffer.prototype.readDoubleBE = function(offset) {
    for(var i = 0; i < 8; this.cu8[i] = this.a[offset+7-i], i++);
    return this.cf64[0];
};

ArrayBuffer.prototype.toString = function(encoding, start, end) {
    var slice = this.a.subarray(start, end);
    return String.fromCharCode.apply(null, slice);
};

ArrayBuffer.prototype.writeUInt8 = function(value, offset) {
    this.a[offset] = value & 0xFF;
};

ArrayBuffer.prototype.writeUInt16BE = function(value, offset) {
    this.a[offset] = ( value >> 8 ) & 0xFF;
    this.a[offset+1] = value & 0xFF;
};

ArrayBuffer.prototype.writeUInt32BE = function(value, offset) {
    this.a[offset] = ( value >>> 24 ) & 0xFF;
    this.a[offset+1] = ( value >>> 16 ) & 0xFF;
    this.a[offset+2] = ( value >>> 8 ) & 0xFF;
    this.a[offset+3] = value & 0xFF;
};

ArrayBuffer.prototype.writeInt8 = function(value, offset) {
    this.b[offset] = value & 0xFF;
};

ArrayBuffer.prototype.writeInt16BE = function(value, offset) {
    this.b[offset] = ( value >>> 8 ) & 0xFF;
    this.b[offset+1] = value & 0xFF;
};

ArrayBuffer.prototype.writeInt32BE = function(value, offset) {
    this.b[offset] = ( value >>> 24 ) & 0xFF;
    this.b[offset+1] = ( value >>> 16 ) & 0xFF;
    this.b[offset+2] = ( value >>> 8 ) & 0xFF;
    this.b[offset+3] = value & 0xFF;
};

ArrayBuffer.prototype.writeFloatBE = function(value, offset) {
    this.cf32[0] = value;
    this.a[offset+3] = this.cu8[0];
    this.a[offset+2] = this.cu8[1];
    this.a[offset+1] = this.cu8[2];
    this.a[offset] = this.cu8[3];
};

ArrayBuffer.prototype.writeDoubleBE = function(value, offset) {
    this.cf64[0] = value;
    this.a[offset+7] = this.cu8[0];
    this.a[offset+6] = this.cu8[1];
    this.a[offset+5] = this.cu8[2];
    this.a[offset+4] = this.cu8[3];
    this.a[offset+3] = this.cu8[4];
    this.a[offset+2] = this.cu8[5];
    this.a[offset+1] = this.cu8[6];
    this.a[offset] = this.cu8[7];  
};

ArrayBuffer.prototype.write = function(value, offset, length, encoding) {
    charList = value.split('');
    for (var i = 0; i < length; i++) {
        this.a[offset+i] = charList[i].charCodeAt(0);
    }
};

