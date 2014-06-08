AssetBundle.prototype.formats.vert = ShaderAsset;
AssetBundle.prototype.formats.frag = ShaderAsset;

function ShaderAsset() {
    AssetPrototype.apply(this, arguments);

    this.shader = null;
    this.attributes = {};
    this.uniforms = {};
}

ShaderAsset.prototype = new AssetPrototype();

ShaderAsset.prototype.subProcess = function() {
    var contents = this.readText(this.data).replace(/\r\n/g, "\n");

    var source = contents;
    if( contents.substring(0,1) === "{" )
    {
        var fio = contents.indexOf("}\n\n");
        var metadata = JSON.parse(contents.substring(0, fio+1).replace(/#/g, ""));
        this.attributes = metadata.attributes || {};
        this.uniforms = metadata.uniforms || {};
        source = contents.substring(fio+3, contents.length);
    }
    
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