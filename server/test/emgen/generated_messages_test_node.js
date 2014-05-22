/*-------------------------------------------------------------*
 * THIS FILE IS AUTO-GENERATED BY EMGEN, DO NOT COMMIT OR EDIT *
 *-------------------------------------------------------------*/

var messages = {};
messages.index = [];

var bufferList = [];
var maxBufferSize = 128000;

var convertBuffer = new ArrayBuffer(8);
var floatArray = new Float32Array(convertBuffer);
var intArray = new Uint16Array(convertBuffer);

function getBuffer() {
    if( bufferList.length == 0 )
    {
        return new Buffer(maxBufferSize);
    }

    return bufferList.pop();
}
messages.getBuffer = getBuffer;

function returnBuffer(buffer) {
    if( buffer )
    {
        bufferList.push(buffer);
    }
}
messages.returnBuffer = returnBuffer;

function MessagePrototype(name, id) {
    this.name = name;
    this.id = id;
};

MessagePrototype.prototype.store = function(buffer) {
    this.buffer = buffer || getBuffer();
    this.bufferOwned = true;
    if( buffer )
    {
        this.bufferOwned = false;
    }
};

MessagePrototype.prototype.retain = function() {
    if( this.references === undefined )
    {
        this.references = 1;
    }
    else
    {
        this.references++;
    }
};

MessagePrototype.prototype.release = function() {
    if( this.references === undefined && this.bufferOwned )
    {
        returnBuffer(this.buffer);
    }
    else
    {
        this.references--;
        if( this.references <= 0 && this.bufferOwned )
        {
            returnBuffer(this.buffer);
        }
    }
};

/* START - ---------------------------------------- SimpleTest */
messages.SimpleTest = function(buffer) {
	this.store(buffer);
	this.retain();

	//Properties
	this.test1 = null; //int8
	this.test2 = null; //int16
	this.test3 = null; //int32
	this.test5 = null; //uint8
	this.test6 = null; //uint16
	this.test7 = null; //uint32
	this.test9 = null; //float
	this.test10 = null; //double
	this.test11 = null; //string
	this.test12 = null; //flag
	this.test13 = null; //flag
	this.test14 = null; //flag
	this.test15 = null; //flag
	this.test16 = null; //flag
	this.test17 = null; //flag
};
messages.index[23] = messages.SimpleTest;

messages.SimpleTest.prototype = new MessagePrototype("SimpleTest", 23);
messages.SimpleTest.create = function(buffer) { return new messages.SimpleTest(buffer); };
messages.SimpleTest.id = 23;

messages.SimpleTest.prototype.pack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to pack message into!");

	if(obj.test1 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test1'.");
	if(obj.test2 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test2'.");
	if(obj.test3 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test3'.");
	if(obj.test5 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test5'.");
	if(obj.test6 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test6'.");
	if(obj.test7 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test7'.");
	if(obj.test9 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test9'.");
	if(obj.test10 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test10'.");
	if(obj.test11 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test11'.");
	if(obj.test12 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test12'.");
	if(obj.test13 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test13'.");
	if(obj.test14 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test14'.");
	if(obj.test15 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test15'.");
	if(obj.test16 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test16'.");
	if(obj.test17 === null) throw new Error("Incomplete message 'SimpleTest' is missing property 'test17'.");

	buffer.writeUInt16BE(23, 0, true); //Write message ID
	buffer.writeUInt32BE(0, 2, true); //Write message size placeholder

	buffer.writeInt8(obj.test1, offset, true);
	offset += 1;

	buffer.writeInt16BE(obj.test2, offset, true);
	offset += 2;

	buffer.writeInt32BE(obj.test3, offset, true);
	offset += 4;

	buffer.writeUInt8(obj.test5, offset, true);
	offset += 1;

	buffer.writeUInt16BE(obj.test6, offset, true);
	offset += 2;

	buffer.writeUInt32BE(obj.test7, offset, true);
	offset += 4;

	buffer.writeFloatBE(obj.test9, offset, true);
	offset += 4;

	buffer.writeDoubleBE(obj.test10, offset, true);
	offset += 8;

	buffer.writeUInt32BE(obj.test11.length, offset, true);
	offset += 4;
	if(obj.test11.length > 0) {
		buffer.write(obj.test11, offset, obj.test11.length, 'utf8');
		offset += obj.test11.length;
	}

	var flags = 0;
	if(obj.test12)flags |= (1 << 0);
	if(obj.test13)flags |= (1 << 1);
	if(obj.test14)flags |= (1 << 2);
	if(obj.test15)flags |= (1 << 3);
	if(obj.test16)flags |= (1 << 4);
	if(obj.test17)flags |= (1 << 5);
	buffer.writeUInt8(flags, offset, true);
	offset += 1;

	buffer.writeUInt32BE(offset, 2, true); //Write actual message size

	return offset;
};

messages.SimpleTest.prototype.unpack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to unpack message from!");

	obj.test1 = buffer.readInt8(offset, true);
	offset += 1;

	obj.test2 = buffer.readInt16BE(offset, true);
	offset += 2;

	obj.test3 = buffer.readInt32BE(offset, true);
	offset += 4;

	obj.test5 = buffer.readUInt8(offset, true);
	offset += 1;

	obj.test6 = buffer.readUInt16BE(offset, true);
	offset += 2;

	obj.test7 = buffer.readUInt32BE(offset, true);
	offset += 4;

	obj.test9 = buffer.readFloatBE(offset, true);
	offset += 4;

	obj.test10 = buffer.readDoubleBE(offset, true);
	offset += 8;

	var length = buffer.readUInt32BE(offset, true);
	offset += 4;
	if(length > 0) {
		obj.test11 = buffer.toString('utf8', offset, offset + length);
		offset += length;
	}

	var flags = buffer.readUInt8(offset, true);
	offset += 1;

	obj.test12 = !!(flags & (1 << 0));
	obj.test13 = !!(flags & (1 << 1));
	obj.test14 = !!(flags & (1 << 2));
	obj.test15 = !!(flags & (1 << 3));
	obj.test16 = !!(flags & (1 << 4));
	obj.test17 = !!(flags & (1 << 5));
	return offset;
};
/* END --- ---------------------------------------- SimpleTest */

/* START - ----------------------------------------- FlagTest1 */
messages.FlagTest1 = function(buffer) {
	this.store(buffer);
	this.retain();

	//Properties
	this.flag1 = null; //flag
	this.flag2 = null; //flag
	this.flag3 = null; //flag
	this.flag4 = null; //flag
	this.flag5 = null; //flag
	this.flag6 = null; //flag
	this.flag7 = null; //flag
	this.flag8 = null; //flag
	this.flag9 = null; //flag
	this.flag10 = null; //flag
	this.flag11 = null; //flag
	this.flag12 = null; //flag
};
messages.index[29] = messages.FlagTest1;

messages.FlagTest1.prototype = new MessagePrototype("FlagTest1", 29);
messages.FlagTest1.create = function(buffer) { return new messages.FlagTest1(buffer); };
messages.FlagTest1.id = 29;

messages.FlagTest1.prototype.pack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to pack message into!");

	if(obj.flag1 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag1'.");
	if(obj.flag2 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag2'.");
	if(obj.flag3 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag3'.");
	if(obj.flag4 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag4'.");
	if(obj.flag5 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag5'.");
	if(obj.flag6 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag6'.");
	if(obj.flag7 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag7'.");
	if(obj.flag8 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag8'.");
	if(obj.flag9 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag9'.");
	if(obj.flag10 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag10'.");
	if(obj.flag11 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag11'.");
	if(obj.flag12 === null) throw new Error("Incomplete message 'FlagTest1' is missing property 'flag12'.");

	buffer.writeUInt16BE(29, 0, true); //Write message ID
	buffer.writeUInt32BE(0, 2, true); //Write message size placeholder

	var flags = 0;
	if(obj.flag1)flags |= (1 << 0);
	if(obj.flag2)flags |= (1 << 1);
	if(obj.flag3)flags |= (1 << 2);
	if(obj.flag4)flags |= (1 << 3);
	if(obj.flag5)flags |= (1 << 4);
	if(obj.flag6)flags |= (1 << 5);
	if(obj.flag7)flags |= (1 << 6);
	if(obj.flag8)flags |= (1 << 7);
	if(obj.flag9)flags |= (1 << 8);
	if(obj.flag10)flags |= (1 << 9);
	if(obj.flag11)flags |= (1 << 10);
	if(obj.flag12)flags |= (1 << 11);
	buffer.writeUInt16BE(flags, offset, true);
	offset += 2;

	buffer.writeUInt32BE(offset, 2, true); //Write actual message size

	return offset;
};

messages.FlagTest1.prototype.unpack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to unpack message from!");

	var flags = buffer.readUInt16BE(offset, true);
	offset += 2;

	obj.flag1 = !!(flags & (1 << 0));
	obj.flag2 = !!(flags & (1 << 1));
	obj.flag3 = !!(flags & (1 << 2));
	obj.flag4 = !!(flags & (1 << 3));
	obj.flag5 = !!(flags & (1 << 4));
	obj.flag6 = !!(flags & (1 << 5));
	obj.flag7 = !!(flags & (1 << 6));
	obj.flag8 = !!(flags & (1 << 7));
	obj.flag9 = !!(flags & (1 << 8));
	obj.flag10 = !!(flags & (1 << 9));
	obj.flag11 = !!(flags & (1 << 10));
	obj.flag12 = !!(flags & (1 << 11));
	return offset;
};
/* END --- ----------------------------------------- FlagTest1 */

/* START - ----------------------------------------- FlagTest2 */
messages.FlagTest2 = function(buffer) {
	this.store(buffer);
	this.retain();

	//Properties
	this.flag1 = null; //flag
	this.flag2 = null; //flag
	this.flag3 = null; //flag
	this.flag4 = null; //flag
	this.flag5 = null; //flag
	this.flag6 = null; //flag
	this.flag7 = null; //flag
	this.flag8 = null; //flag
	this.flag9 = null; //flag
	this.flag10 = null; //flag
	this.flag11 = null; //flag
	this.flag12 = null; //flag
	this.flag13 = null; //flag
	this.flag14 = null; //flag
	this.flag15 = null; //flag
	this.flag16 = null; //flag
	this.flag17 = null; //flag
	this.flag18 = null; //flag
	this.flag19 = null; //flag
};
messages.index[30] = messages.FlagTest2;

messages.FlagTest2.prototype = new MessagePrototype("FlagTest2", 30);
messages.FlagTest2.create = function(buffer) { return new messages.FlagTest2(buffer); };
messages.FlagTest2.id = 30;

messages.FlagTest2.prototype.pack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to pack message into!");

	if(obj.flag1 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag1'.");
	if(obj.flag2 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag2'.");
	if(obj.flag3 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag3'.");
	if(obj.flag4 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag4'.");
	if(obj.flag5 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag5'.");
	if(obj.flag6 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag6'.");
	if(obj.flag7 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag7'.");
	if(obj.flag8 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag8'.");
	if(obj.flag9 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag9'.");
	if(obj.flag10 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag10'.");
	if(obj.flag11 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag11'.");
	if(obj.flag12 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag12'.");
	if(obj.flag13 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag13'.");
	if(obj.flag14 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag14'.");
	if(obj.flag15 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag15'.");
	if(obj.flag16 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag16'.");
	if(obj.flag17 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag17'.");
	if(obj.flag18 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag18'.");
	if(obj.flag19 === null) throw new Error("Incomplete message 'FlagTest2' is missing property 'flag19'.");

	buffer.writeUInt16BE(30, 0, true); //Write message ID
	buffer.writeUInt32BE(0, 2, true); //Write message size placeholder

	var flags = 0;
	if(obj.flag1)flags |= (1 << 0);
	if(obj.flag2)flags |= (1 << 1);
	if(obj.flag3)flags |= (1 << 2);
	if(obj.flag4)flags |= (1 << 3);
	if(obj.flag5)flags |= (1 << 4);
	if(obj.flag6)flags |= (1 << 5);
	if(obj.flag7)flags |= (1 << 6);
	if(obj.flag8)flags |= (1 << 7);
	if(obj.flag9)flags |= (1 << 8);
	if(obj.flag10)flags |= (1 << 9);
	if(obj.flag11)flags |= (1 << 10);
	if(obj.flag12)flags |= (1 << 11);
	if(obj.flag13)flags |= (1 << 12);
	if(obj.flag14)flags |= (1 << 13);
	if(obj.flag15)flags |= (1 << 14);
	if(obj.flag16)flags |= (1 << 15);
	if(obj.flag17)flags |= (1 << 16);
	if(obj.flag18)flags |= (1 << 17);
	if(obj.flag19)flags |= (1 << 18);
	buffer.writeUInt32BE(flags, offset, true);
	offset += 4;

	buffer.writeUInt32BE(offset, 2, true); //Write actual message size

	return offset;
};

messages.FlagTest2.prototype.unpack = function(buffer, offset, obj) {
	obj = obj || this;
	buffer = buffer || this.buffer;
	if(offset === undefined)offset = 6;
	if(!buffer)throw new Error("No buffer to unpack message from!");

	var flags = buffer.readUInt32BE(offset, true);
	offset += 4;

	obj.flag1 = !!(flags & (1 << 0));
	obj.flag2 = !!(flags & (1 << 1));
	obj.flag3 = !!(flags & (1 << 2));
	obj.flag4 = !!(flags & (1 << 3));
	obj.flag5 = !!(flags & (1 << 4));
	obj.flag6 = !!(flags & (1 << 5));
	obj.flag7 = !!(flags & (1 << 6));
	obj.flag8 = !!(flags & (1 << 7));
	obj.flag9 = !!(flags & (1 << 8));
	obj.flag10 = !!(flags & (1 << 9));
	obj.flag11 = !!(flags & (1 << 10));
	obj.flag12 = !!(flags & (1 << 11));
	obj.flag13 = !!(flags & (1 << 12));
	obj.flag14 = !!(flags & (1 << 13));
	obj.flag15 = !!(flags & (1 << 14));
	obj.flag16 = !!(flags & (1 << 15));
	obj.flag17 = !!(flags & (1 << 16));
	obj.flag18 = !!(flags & (1 << 17));
	obj.flag19 = !!(flags & (1 << 18));
	return offset;
};
/* END --- ----------------------------------------- FlagTest2 */

module.exports = messages;