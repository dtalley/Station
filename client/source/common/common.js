var processes = [
    {
        title: "Client",
        name: "client",
        id: 0
    },
    {
        title: "Gateway",
        name: "gateway",
        id: 3
    },
    {
        title: "Authentication",
        name: "authentication",
        id: 4
    }
];

module.exports.ProcessIndex = [];
processes.forEach(function(process){
    module.exports.ProcessIndex[process.id] = process;
});

module.exports.ProcessTypes = {};

module.exports.ProcessIndex.forEach(function(process, i){
    if( process === undefined || process === null )
    {
        process = module.exports.ProcessIndex[i] = {
            title: "Unknown",
            name: "unknown",
            id: i
        }
    }

    process.flag = 1 << process.id;

    module.exports.ProcessTypes[process.title] = process;
});

module.exports.getProcessTitle = function(id) {
    if( id >= this.ProcessIndex.length )
    {
        return "Unknown";
    }
    
    return this.ProcessIndex[id].title;
}