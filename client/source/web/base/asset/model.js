AssetBundle.prototype.formats.oml = ModelAsset;

function ModelAsset() {
    AssetPrototype.apply(this, arguments);

    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.parsed = null;
    this.vertices = null;
    this.indices = null;

    this.attributes = [];
}

ModelAsset.prototype = new AssetPrototype();

ModelAsset.prototype.subProcess = function() {
    

    this.onProcessed();
};

ModelAsset.prototype.createBuffers = function() {
    if( this.vertices )
    {
        this.vertexBuffer = window.gr.createVertexBuffer(this.vertices, this.attributes);
    }

    if( this.indices )
    {
        this.indexBuffer = window.gr.createIndexBuffer(this.indices, window.gr.Triangles);
    }
};