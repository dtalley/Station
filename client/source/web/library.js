function RingBuffer(length) {
    this.length = length;

    this.start = 0;
    this.end = -1;
    this.span = 0;
}

RingBuffer.prototype = Object.create(Array.prototype);

RingBuffer.prototype.push = function(obj) {
    this.end++;
    if(this.span<this.length)this.span++;
    if( this.end >= this.length )
    {
        this.end = 0;
    }
    this[this.end] = obj;
    return obj;
};

RingBuffer.prototype.pop = function() {
    var obj = this[this.end];
    this.end--;
    if(this.span>0)this.span--;
    if( this.end < 0 )
    {
        this.end = this.length-1;
    }
    return obj;
};

RingBuffer.prototype.unshift = function(obj) {
    this.start--;
    if(this.span<this.length)this.span++;
    if( this.start < 0 )
    {
        this.start = this.length-1;
    }
    this[this.start] = obj;
    return obj;
};

RingBuffer.prototype.shift = function() {
    var obj = this[this.start];
    this.start++;
    if(this.span>0)this.span--;
    if( this.start === this.length )
    {
        this.start = 0;
    }
    return obj;
};

function EventEmitter() {
    this.events = {};
}

EventEmitter.prototype.on = function(event, callback, owner) {
    if( !this.events[event] ) 
    {
        this.events[event] = {
            indices:new RingBuffer(10), 
            listeners:[]
        };
    }

    var registry = {
        cb: callback,
        o: owner
    };
    var info = this.events[event];

    if( info.indices.span > 0 )
    {
        info.listeners[info.indices.shift()] = registry;
    }
    else
    {
        info.listeners.push(registry);
    }
};

EventEmitter.prototype.emit = function(event, data) {
    if( !this.events[event] ) return;

    this.events[event].listeners.forEach(function(listener){
        if( !listener ) return;
        listener.cb.call(listener.o, data);
    });
};

EventEmitter.prototype.off = function(event, callback) {
    if( !this.events[event] ) return;

    var info = this.events[event];

    info.listeners.some(function(listener, i){
        if( !listener ) return false;

        if( listener.o === callback || listener.cb === callback )
        {
            info.indices.push(i);
            info.listeners[i] = null;
            return true;
        }

        return false;
    });
};