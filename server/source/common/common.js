module.exports.ProcessTypes = {
    Client: {
        id: 0,
        name: "client"
    },
    Drone: {
        id: 1,
        name: "drone"
    },
    Master: {
        id: 2,
        name: "master"
    }
};

module.exports.Processes = [];
module.exports.ProcessFlags = {};
for( var key in module.exports.ProcessTypes )
{
    module.exports.Processes[module.exports.ProcessTypes[key].id] = module.exports.ProcessTypes[key];
    module.exports.ProcessFlags[key] = 1 << module.exports.ProcessTypes[key].id;
}