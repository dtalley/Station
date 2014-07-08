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

    if(this.parsed.config)
    {
        if(this.parsed.config.type)
        {
            switch(this.parsed.config.type)
            {
                case "lines":
                    this.drawType = graphics.Lines;
                    break;
            }
        }
    }

    this.attributes = this.parsed.attributes;

    this.vertices = new Float32Array(this.parsed.vertices);

    if( this.parsed.indices )
    {
        this.indices = new Uint16Array(this.parsed.indices);
    }

    this.createBuffers();

    this.onProcessed();
};

ModelAsset.prototype.createBuffers = function() {
    var graphics = window.graphics;
    if( this.vertices )
    {
        this.vertexBuffer = graphics.createVertexBuffer(this.vertices, this.attributes);
    }

    if( this.indices )
    {
        this.indexBuffer = graphics.createIndexBuffer(this.indices, this.drawType || graphics.Triangles);
    }
};