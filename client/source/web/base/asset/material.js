AssetBundle.prototype.formats.mtrl = MaterialAsset;

function MaterialAsset(ext, contents) {
    this.ext = ext;
    this.program = contents;
}

MaterialAsset.prototype = new AssetPrototype();

MaterialAsset.prototype.subProcess = function() {
    this.onProcessed();
};

MaterialAsset.prototype.bind = function() {
    if( this.program && this.program.processed )
    {
        this.program.bind();
    }
};