var _={};

_.extend = function(object) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    
    var argsIndex = 0, argsLength = arguments.length;
    while (++argsIndex < argsLength) {
        iterable = arguments[argsIndex];
        var isObject = typeof iterable === "function" || typeof iterable === "object";
        if (iterable) {
            var ownIndex = -1,
                ownProps = isObject && Object.keys(iterable),
                length = ownProps ? ownProps.length : 0;

            while (++ownIndex < length) {
                index = ownProps[ownIndex];
                result[index] = iterable[index];
            }
        }
    }
    return result;
};

function StackPool() {
    this.top = 0;
    this.last = null;
}

StackPool.prototype = Object.create(Array.prototype);

StackPool.prototype.push = function(value) {
    this[this.top++] = value;
    this.last = value;
    if(this.length>1000)
        console.log(this.length);
};

StackPool.prototype.pop = function() {
    var ret = null;
    if(this.top>0)
    {
        ret = this[--this.top];
        this[this.top] = 0;
    }

    this.last = null;
    if(this.top>0)
    {
        this.last = this[this.top-1];
    }

    return ret;
};

function RingBuffer() {
    this.start = 0;
    this.end = -1;
    this.span = 0;
    this.length = 0;
    this.first = null;
    this.array = [];
    this.i = 0;
}

RingBuffer.prototype.push = function(obj) {
    this.end++;
    this.span++;

    //Wrap around if we have space in the front
    if( this.end >= this.length && this.start > 0 )
    {
        this.end = 0;
    }

    //We're out of room
    if(this.span > this.length)
    {
        this.array.push(null);
        this.length++;

        if(this.length>1000)
            console.log(this.length);

        if(this.start>0)
        {
            for( this.i = this.length - 1; this.i > this.start; this.array[this.i] = this.array[this.i-1], this.i-- );
            this.start++;
        }
    }

    this.array[this.end] = obj;

    this.first = null;
    if( this.span > 0 )
    {
        this.first = this.array[this.start];
    }

    return obj;
};

RingBuffer.prototype.shift = function() {
    if(this.span===0)throw new Error("RingBuffer out of values!");
    var obj = this.array[this.start];

    if(this.span > 1)
    {
        this.start++;
    }
    else
    {
        this.end--;
    }
    this.span--;

    if( this.start === this.length )
    {
        this.start = 0;
    }

    this.first = null;
    if( this.span > 0 )
    {
        this.first = this.array[this.start];
    }

    return obj;
};

function ObjectRegistry() {
    this.array = [];
    this.length = 0;
}

ObjectRegistry.prototype.add = function(object) {
    if( this.length === this.array.length )
    {
        this.array.push(object);
    }
    else
    {
        this.array[this.length] = object;
    }
    this.length++;
};

ObjectRegistry.prototype.remove = function(object) {
    var index = this.array.indexOf(object);

    if( index >= 0 )
    {
        this.array[index] = this.array[this.length-1];
        this.array[this.length-1] = null;
        this.length--;
    }
};

ObjectRegistry.prototype.clear = function() {
    this.length = 0;
};

function EventManager() {
    this.registries = new StackPool();
}

function EventEmitter() {
    this.events = {};
}

EventEmitter.prototype = new EventManager();

EventEmitter.prototype.EventRegistry = function(callback, owner) {
    this.cb = callback;
    this.o = owner;
};

EventEmitter.prototype.getRegistry = function(callback, owner) {
    if( this.registries.top === 0 )
    {
        return new this.EventRegistry(callback, owner);
    }

    var registry = this.registries.pop();
    registry.cb = callback;
    registry.o = owner;
    return registry;
};

EventEmitter.prototype.on = function(event, callback, owner) {
    if( this.events[event] === undefined ) 
    {
        this.events[event] = {
            listeners:new ObjectRegistry()
        };
    }

    var registry = this.getRegistry(callback, owner);
    this.events[event].listeners.add(registry);
};

EventEmitter.prototype.emit = function(event, data) {
    if( !this.events[event] ) return;

    var listeners = this.events[event].listeners;
    var count = listeners.length;
    for( var i = 0; i < count; i++ )
    {
        var listener = listeners.array[i];
        listener.cb.call(listener.o, data);
    }
};

EventEmitter.prototype.off = function(event, callbackOrOwner) {
    if( !this.events[event] ) return;

    var listeners = this.events[event].listeners;

    var count = listeners.length;
    for( var i = 0; i < count; i++ )
    {
        var listener = listeners.array[i];
        if( !callbackOrOwner || listener.cb === callbackOrOwner || listener.o === callbackOrOwner )
        {
            this.registries.push(listener);
            listeners.remove(listener);
            i--;
            count--;
        }
    }
};

ArrayBuffer.prototype.copy = function(target, targetOffset, sourceOffset)
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
    if(this.a) return this;

    this.a = new Uint8Array(this, 0, this.byteLength);
    this.b = new Int8Array(this, 0, this.byteLength);

    return this;
};

ArrayBuffer.prototype.readUInt8 = function(offset) {
    return this.a[offset];
};

ArrayBuffer.prototype.readUInt16BE = function(offset) {
    return ((this.a[offset] << 8) >>> 0) +
           this.a[offset+1];
};

ArrayBuffer.prototype.readUInt32BE = function(offset) {
    return ((this.a[offset] << 24) >>> 0) +
           (this.a[offset+1] << 16) +
           (this.a[offset+2] << 8) +
           this.a[offset+3];
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