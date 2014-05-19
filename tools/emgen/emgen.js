var config = require("./config.json");
var fs = require("fs");

var generation = {};
for( var key in config.projects ) 
{
    var project = config.projects[key];
    var file = __dirname + "/../../" + project.path + "/generated_messages_" + key + ".js";
    
    var file = fs.openSync(file, 'w');
    
    var code = fs.openSync(__dirname + "/emgen-" + project.type + ".js", 'r');
    var read = new Buffer(1024);
    var bytes = 0;
    while(bytes = fs.readSync(code, read, 0, read.length))
    {
        fs.writeSync(file, read, 0, bytes);
    }
    fs.closeSync(code);

    project.file = file;
    project.name = key;
}

function write(project, text) {
    var buffer = new Buffer(text);
    fs.writeSync(config.projects[project].file, buffer, 0, buffer.length);
}

var storedMessages = {};
var forcedId = -1;
var id = 0;

config.files.forEach(function(file){
    var messages = require(__dirname + "/../../" + file);
    
    for( var key in messages )
    {
        var message = messages[key];

        storedMessages[key] = message;
        console.log("Found message '" + key + "'");

        if( message.forcedId !== undefined && forcedId < message.forcedId )
        {
            forcedId = message.forcedId;
        }
    }
});

id = forcedId + 1;

for( var key in storedMessages )
{
    var message = storedMessages[key];
    message.id = message.forcedId !== undefined ? message.forcedId : id++;

    var projects = {};

    message.packers.forEach(function(packer){
        if( config.projects[packer] )
        {
            projects[packer] = {
                pack: true,
                unpack: false
            };
        }
        else if( config.groups[packer] )
        {
            config.groups[packer].forEach(function(project){
                projects[project] = {
                    pack: true,
                    unpack: false
                };
            });
        }
    });

    message.unpackers.forEach(function(unpacker){
        if( config.projects[unpacker] )
        {
            if( projects[unpacker] )
            {
                projects[unpacker].unpack = true;
            }
            else
            {
                projects[unpacker] = {
                    pack: false,
                    unpack: true
                };
            }
        }
        else if( config.groups[unpacker] )
        {
            config.groups[unpacker].forEach(function(project){
                if( projects[project] )
                {
                    projects[project].unpack = true;
                }
                else
                {
                    projects[project] = {
                        pack: false,
                        unpack: true
                    };
                }
            });
        }
    });

    for( var name in projects ) 
    {
        var project = config.projects[name];
        var projectFlags = projects[name];
        var buffer = null;

        var padding = " " + key;
        while( padding.length < 51 )
        {
            padding = "-" + padding;
        }

        if( project.type == "node" )
        {
            write(
                name,
                "/* START - " + padding + " */\n"
            );

            write(
                name,
                "messages." + key + " = function(buffer) {\n"
            );

            write(name, "\tthis.store(buffer);\n");
            write(name, "\tthis.retain();\n\n");

            for( var property in message.properties )
            {
                write(
                    name,
                    "\tthis." + property + " = null;\n"
                );
            }

            write(
                name,
                "};\n" +
                "messages.index[" + message.id + "] = messages." + key + ";\n\n"
            );

            write(
                name,
                "messages." + key + ".prototype = new MessagePrototype(\"" + key + "\", " + message.id + ");\n" + 
                "messages." + key + ".create = function(buffer) { return new messages." + key + "(buffer); };\n" +
                "messages." + key + ".id = " + message.id + ";\n\n"
            );
        }

        if( projectFlags.pack )
        {
            if( project.type == "node" )
            {
                write(
                    name,
                    "messages." + key + ".prototype.pack = function(buffer, offset, obj) {\n" +
                    "\tobj = obj || this;\n" +
                    "\tbuffer = buffer || this.buffer;\n" +
                    "\tif(offset === undefined)offset = 6;\n\n"
                );

                for( var property in message.properties )
                {
                    write(
                        name,
                        "\tif(obj." + property + " === null) throw new Error(\"Incomplete message '" + key + "' is missing property '" + property + "'.\");\n"
                    );
                }

                write(name, "\n\tbuffer.writeUInt16BE(" + message.id + ", 0, true); //Write message ID\n");
                write(name, "\tbuffer.writeUInt32BE(0, 2, true); //Write message size placeholder\n\n");

                var flags = [];
                var offset = 0;
                for( var property in message.properties )
                {
                    var type = message.properties[property];
                    
                    var arrayStart = type.indexOf("[");
                    var arrayCount = "";
                    var arrayAdd = "";
                    var spacer ="\t";
                    if( arrayStart > 0 )
                    {
                        arrayCount = type.substring(arrayStart + 1, type.length - 1);
                        type = type.substring(0, arrayStart);

                        if( type === "flag" )
                        {
                            throw new Error("Arrays of flags are unsupported (and unnecessary).");
                        }

                        if( message.properties[arrayCount] )
                        {
                            arrayCount = "obj." + arrayCount;
                        }

                        arrayAdd = "[i]";

                        spacer = "\t\t";

                        write(name, "\tfor(var i = 0; i < " + arrayCount + "; i++) {\n");
                    }

                    switch(type)
                    {
                        case "int32":
                            write(name, spacer + "buffer.writeInt32BE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "int16":
                            write(name, spacer + "buffer.writeInt16BE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 2;\n");
                            break;

                        case "int8":
                            write(name, spacer + "buffer.writeInt8(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 1;\n");
                            break;

                        case "uint32":
                            write(name, spacer + "buffer.writeUInt32BE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "uint16":
                            write(name, spacer + "buffer.writeUInt16BE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 2;\n");
                            break;

                        case "uint8":
                            write(name, spacer + "buffer.writeUInt8(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 1;\n");
                            break;

                        case "float":
                            write(name, spacer + "buffer.writeFloatBE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "double":
                            write(name, spacer + "buffer.writeDoubleBE(obj." + property + arrayAdd + ", offset, true);\n");
                            write(name, spacer + "offset += 8;\n");
                            break;

                        case "string":
                            write(name, spacer + "buffer.writeUInt32BE(obj." + property + arrayAdd + ".length, offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            write(name, spacer + "if(obj." + property + arrayAdd + ".length > 0) {\n");
                            write(name, spacer + "\tbuffer.write(obj." + property + arrayAdd + ", offset, obj." + property + arrayAdd + ".length, 'utf8');\n");
                            write(name, spacer + "\toffset += obj." + property + arrayAdd + ".length;\n");
                            write(name, spacer + "}\n");
                            break;

                        case "flag":
                            flags.push(property);
                            break;

                        default:
                            if( storedMessages[type] )
                            {
                                write(name, spacer + "offset += messages." + type + ".prototype.pack(buffer, offset, obj." + property + arrayAdd + ");\n");
                            }
                            else
                            {
                                throw new Error("Unsupported type: '" + type + "'");
                            }
                    }

                    if( arrayStart > 0 )
                    {
                        write(name, "\t}\n\n");
                    }
                    else if( type !== "flag")
                    {
                        write(name, "\n");
                    }
                }

                if( flags.length > 0 )
                {
                    var currentFlag = 0;
                    write(name, "\tvar flags = 0;\n");
                    flags.forEach(function(flag){
                        write(name, "\tif(obj." + flag + ")flags |= (1 << " + currentFlag++ + ");\n");
                    });

                    if(flags.length > 16)
                    {
                        write(name, spacer + "buffer.writeUInt32BE(flags, offset, true);\n");
                        write(name, spacer + "offset += 4;\n\n");
                    }
                    else if( flags.length > 8)
                    {
                        write(name, spacer + "buffer.writeUInt16BE(flags, offset, true);\n");
                        write(name, spacer + "offset += 2;\n\n");
                    }
                    else
                    {
                        write(name, spacer + "buffer.writeUInt8(flags, offset, true);\n");
                        write(name, spacer + "offset += 1;\n\n");
                    }
                }

                write(name, "\tbuffer.writeUInt32BE(offset, 2, true); //Write actual message size\n\n");

                write(
                    name,
                    "\treturn offset;\n" +
                    "};\n\n"
                );
            }
        }

        if( projectFlags.unpack )
        {
            if( project.type == "node" )
            {
                write(
                    name,
                    "messages." + key + ".prototype.unpack = function(buffer, offset, obj) {\n" +
                    "\tobj = obj || this;\n" +
                    "\tbuffer = buffer || this.buffer;\n" +
                    "\tif(offset === undefined)offset = 6;\n\n"
                );

                var flags = [];
                var offset = 0;
                for( var property in message.properties )
                {
                    var type = message.properties[property];
                    
                    var arrayStart = type.indexOf("[");
                    var arrayCount = "";
                    var arrayAdd = "";
                    var spacer ="\t";
                    if( arrayStart > 0 )
                    {
                        arrayCount = type.substring(arrayStart + 1, type.length - 1);
                        type = type.substring(0, arrayStart);

                        if( type === "flag" )
                        {
                            throw new Error("Arrays of flags are unsupported (and unnecessary).");
                        }

                        if( message.properties[arrayCount] )
                        {
                            arrayCount = "obj." + arrayCount;
                        }

                        arrayAdd = "[i]";

                        spacer = "\t\t";

                        write(name, "\tfor(var i = 0; i < " + arrayCount + "; i++) {\n");
                    }

                    switch(type)
                    {
                        case "int64":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readInt32BE(offset, true) << 32;\n");
                            write(name, spacer + "offset += 4;\n");
                            write(name, spacer + "obj." + property + arrayAdd + " |= buffer.readInt32BE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "int32":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readInt32BE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "int16":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readInt16BE(offset, true);\n");
                            write(name, spacer + "offset += 2;\n");
                            break;

                        case "int8":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readInt8(offset, true);\n");
                            write(name, spacer + "offset += 1;\n");
                            break;

                        case "uint64":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readUInt32BE(offset, true) << 32;\n");
                            write(name, spacer + "offset += 4;\n");
                            write(name, spacer + "obj." + property + arrayAdd + " |= buffer.readUInt32BE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "uint32":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readUInt32BE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "uint16":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readUInt16BE(offset, true);\n");
                            write(name, spacer + "offset += 2;\n");
                            break;

                        case "uint8":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readUInt8(offset, true);\n");
                            write(name, spacer + "offset += 1;\n");
                            break;

                        case "float":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readFloatBE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            break;

                        case "double":
                            write(name, spacer + "obj." + property + arrayAdd + " = buffer.readDoubleBE(offset, true);\n");
                            write(name, spacer + "offset += 8;\n");
                            break;

                        case "string":
                            write(name, spacer + "var length = buffer.readUInt32BE(offset, true);\n");
                            write(name, spacer + "offset += 4;\n");
                            write(name, spacer + "if(length > 0) {\n");
                            write(name, spacer + "\tobj." + property + arrayAdd + " = buffer.toString('utf8', offset, offset + length);\n");
                            write(name, spacer + "\toffset += length;\n");
                            write(name, spacer + "}\n");
                            break;

                        case "flag":
                            flags.push(property);
                            break;

                        default:
                            if( storedMessages[type] )
                            {
                                write(name, spacer + "offset += messages." + type + ".prototype.pack(buffer, offset, obj." + property + arrayAdd + ");\n");
                            }
                            else
                            {
                                throw new Error("Unsupported type: '" + type + "'");
                            }
                    }

                    if( arrayStart > 0 )
                    {
                        write(name, "\t}\n\n");
                    }
                    else if( type !== "flag")
                    {
                        write(name, "\n");
                    }
                }

                if( flags.length > 0 )
                {
                    var currentFlag = 0;

                    if(flags.length > 16)
                    {
                        write(name, "\tvar flags = buffer.readUInt32BE(offset, true);\n");
                        write(name, spacer + "offset += 4;\n\n");
                    }
                    else if( flags.length > 8)
                    {
                        write(name, "\tvar flags = buffer.readUInt16BE(offset, true);\n");
                        write(name, spacer + "offset += 2;\n\n");
                    }
                    else
                    {
                        write(name, "\tvar flags = buffer.readUInt8(offset, true);\n");
                        write(name, spacer + "offset += 1;\n\n");
                    }

                    
                    flags.forEach(function(flag){
                        write(name, "\tobj." + flag + " = !!(flags & (1 << " + currentFlag++ + "));\n");
                    });
                }

                write(
                    name,
                    "\treturn offset;\n" +
                    "};\n\n"
                );
            }
        }

        if( project.type == "node" )
        {
            write(
                name,
                "/* END --- " + padding + " */\n\n"
            );
        }
    }
}

for( var key in config.projects ) 
{
    var project = config.projects[key];

    if( project.type === "node" )
    {
        write(key, "module.exports = messages;");
    }

    fs.closeSync(project.file);
}