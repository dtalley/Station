module.exports.ProcessIndex = [
    {
        title: "Client",
        name: "client"
    },
    {
        title: "Drone",
        name: "drone"
    },
    {
        title: "Master",
        name: "master"
    }
];

module.exports.ProcessTypes = {};

module.exports.ProcessIndex.forEach(function(process, i){
    module.exports.ProcessTypes[process.title] = process;
    process.id = i;
});

module.exports.Processes = [];
module.exports.ProcessFlags = {};
for( var key in module.exports.ProcessTypes )
{
    module.exports.Processes[module.exports.ProcessTypes[key].id] = module.exports.ProcessTypes[key];
    module.exports.ProcessFlags[key] = 1 << module.exports.ProcessTypes[key].id;
}