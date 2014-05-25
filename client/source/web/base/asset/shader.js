AssetBundle.prototype.formats.vert = ShaderAsset;
AssetBundle.prototype.formats.frag = ShaderAsset;

function ShaderAsset(ext, contents) {
    this.onContentsRead = this.onContentsRead.bind(this);

    this.ext = ext;
    this.contents = contents;

    this.reader = new FileReader();
    this.shader = null;
}

ShaderAsset.prototype = new AssetPrototype();

ShaderAsset.prototype.subProcess = function() {
    this.reader.onload = this.onContentsRead;
    this.reader.readAsText(this.contents);
};

ShaderAsset.prototype.onContentsRead = function() {
    var contents = this.reader.result.replace(/\r\n/g, "\n");
    var fio = contents.indexOf("\n\n");
    var metadata = JSON.parse(contents.substring(0, fio).replace(/#/g, ""));
    this.attributes = metadata.attributes;
    this.uniforms = metadata.uniforms;
    var source = contents.substring(fio+2, contents.length);
    
    if( this.ext === "vert" )
    {
        this.shader = window.gr.createShader(source, window.gr.VertexShader);
    }
    else if( this.ext === "frag" )
    {
        this.shader = window.gr.createShader(source, window.gr.FragmentShader);
    }

    this.onProcessed();
};