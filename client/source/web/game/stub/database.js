function DataTable(records) {
    this.records = records;
}

DataTable.prototype.getByIndex = function(i) {
    if( i < this.records.length )
    {
        return this.records[i];
    }
};

(function(){
    var items = new DataTable([
        {
            useable: true,
            deployable: true,
            model: "models/test/cube.oml"
        }
    ]);

    window.asset.register("tables/test/items.dtb", items);
})();