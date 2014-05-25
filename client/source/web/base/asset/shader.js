AssetBundle.prototype.formats.vert = ShaderAsset;
AssetBundle.prototype.formats.frag = ShaderAsset;

function ShaderAsset(ext, contents) {
    this.onContentsRead = this.onContentsRead.bind(this);

    this.ext = ext;
    this.contents = contents;
}

ShaderAsset.prototype = new AssetPrototype();

ShaderAsset.prototype.subProcess = function() {
    this.reader = new FileReader();
    this.reader.onload = this.onContentsRead;
    this.reader.readAsText(this.contents);
};

ShaderAsset.prototype.onContentsRead = function() {
    if( this.ext === "vert" )
    {
        this.shader = window.gr.createShader(this.reader.result, window.gr.VertexShader);
    }
    else if( this.ext === "frag" )
    {
        this.shader = window.gr.createShader(this.reader.result, window.gr.FragmentShader);
    }

    this.processed();
};