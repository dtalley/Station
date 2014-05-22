function Processor(messages) {
    this.targetId = 0;
    this.targetSize = 0;

    this.buffer = messages.getBuffer();
    this.bufferOffset = 0;
    this.bufferStaged = false;

    if( this.buffer instanceof ArrayBuffer )
    {
        this.buffer.imbue();
    }

    this.messages = messages;
}

Processor.prototype = {
    onMessage: function(message) {

    },

    onError: function(text, error) {

    },

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
            var messageClass = this.messages.index[this.targetId];
            
            if( !messageClass || !messageClass.unpack )
            {
                this.onError("Invalid message ID received: " + this.targetId);
            }
            else
            {
                try
                {
                    var obj = messageClass.unpack(this.buffer);
                }
                catch(e)
                {
                    this.onError("Could not unpack message: " + this.targetId, e);
                    return;
                }

                this.onMessage(obj);
            }

            if( this.bufferOffset > this.targetSize )
            {
                this.buffer.copy(this.buffer, 0, 0, this.bufferOffset - this.targetSize);
                this.bufferOffset = this.bufferOffset - this.targetSize;
            }
            else
            {
                this.bufferOffset = 0;
            }

            this.bufferStaged = false;
        }
    },

    destroy: function() {
        this.messages.returnBuffer(this.buffer);
    }
};

var module = module || undefined;

if( module && module.exports )
{
    module.exports.Processor = Processor;
}

