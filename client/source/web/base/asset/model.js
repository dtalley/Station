AssetBundle.prototype.formats.oml = ModelAsset;

function ModelAsset(ext, contents) {
    this.ext = ext;
    this.contents = contents;

    this.model = null;
}

ModelAsset.prototype = new AssetPrototype();

ModelAsset.prototype.subProcess = function() {
    this.vertexBuffer = window.gr.createVertexBuffer(new Float32Array(this.contents), 3, 3);

    this.onProcessed();
};