var _ = require("lodash");
var net = require('net');
var EventEmitter = require("events").EventEmitter;
var Log = require(__dirname + "/log.js");
var nconf = require("nconf");

var messages = require(nconf.get("messageFile"));

function Processor() {
    this.targetId = 0;
    this.targetSize = 0;

    this.buffer = messages.getBuffer();
    this.bufferOffset = 0;
    this.bufferStaged = false;

    this.emitter = new EventEmitter();
}

Processor.prototype = {};

_.extend(Processor.prototype, {
    process: function(data) {
        data.copy(this.buffer, this.bufferOffset, 0, data.length);
        this.bufferOffset += data.length;
        
        if( !this.bufferStaged )
        {
            if( this.bufferOffset < 6 )
            {
                return;   
            }
            
            this.bufferStaged = true;
            this.targetId = this.buffer.readUInt16BE(0);
            this.targetSize = this.buffer.readUInt32BE(2);
        }
        
        if( this.bufferOffset >= this.targetSize )
        {
            var messageClass = messages.index[this.targetId];
            
            if( !messageClass || !messageClass.create )
            {
                this.emitter.emit("error", "Invalid message ID received: " + this.targetId);
            }
            else
            {
                var message = messageClass.create(this.buffer);

                try
                {
                    message.unpack();

                    this.emitter.emit("message", message);
                }
                catch(e)
                {
                    this.emitter.emit("error", "Could not unpack message: " + this.targetId);
                }
            }

            this.bufferOffset = 0;
            this.bufferStaged = false;
        }
    },

    destroy: function() {
        messages.returnBuffer(this.buffer);
    }
});

module.exports.Processor = Processor;