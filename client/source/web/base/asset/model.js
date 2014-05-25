AssetBundle.prototype.formats.oml = ModelAsset;

function ModelAsset() {
    AssetPrototype.apply(this, arguments);

    this.vertexBuffer = null;
    this.parsed = null;
    this.vertices = null;
}

ModelAsset.prototype = new AssetPrototype();

ModelAsset.prototype.subProcess = function() {
    if( !this.parsed )
    {
        this.parsed = JSON.parse(this.readText(this.data));
    }

    if( this.parsed.material )
    {
        var material = window.asset.get(this.parsed.material);
        if( !material )
        {
            this.bundle.add(this.parsed.material, true);
            this.onProcessed(true);
            return;
        }
    }

    this.vertices = new Float32Array(this.parsed.vertices);
    this.vertexBuffer = window.gr.createVertexBuffer(this.vertices, this.parsed.stride, this.parsed.count);

    this.onProcessed();
};