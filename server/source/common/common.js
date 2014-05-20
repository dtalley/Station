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
    },
    {
        title: "Gateway",
        name: "gateway"
    },
    {
        title: "Authentication",
        name: "authentication"
    }
];

module.exports.ProcessTypes = {};

module.exports.ProcessIndex.forEach(function(process, i){
    process.id = i;
    process.flag = 1 << i;

    module.exports.ProcessTypes[process.title] = process;
});

module.exports.getProcessTitle = function(id) {
    if( id >= this.ProcessIndex.length )
    {
        return "Unknown";
    }
    
    return this.ProcessIndex[id].title;
}