AssetBundle.prototype.formats.oml = ModelAsset;

function ModelAsset() {
    AssetPrototype.apply(this, arguments);

    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.parsed = null;
    this.vertices = null;
    this.indices = null;
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
    this.vertexBuffer = window.gr.createVertexBuffer(this.vertices, 3);

    if( this.parsed.indices )
    {
        this.indices = new Uint16Array(this.parsed.indices);
        this.indexBuffer = window.gr.createIndexBuffer(this.indices, 1);
    }

    this.onProcessed();
};