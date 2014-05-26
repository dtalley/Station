AssetBundle.prototype.formats.mtrl = MaterialAsset;

function MaterialAsset() {
    AssetPrototype.apply(this, arguments);

    this.passes = [];
}

MaterialAsset.prototype = new AssetPrototype();

MaterialAsset.prototype.subProcess = function() {
    if( !this.parsed )
    {
        this.parsed = JSON.parse(this.readText(this.data));
    }

    while(this.parsed.passes.length > 0)
    {
        var info = this.parsed.passes[0];

        var vertex = null, fragment = null;

        if( info.program )
        {
            var ready = true;

            vertex = window.asset.get(info.program.vertex);
            if( !vertex )
            {
                ready = false;
                this.bundle.add(info.program.vertex, true);
            }

            fragment = window.asset.get(info.program.fragment);
            if( !fragment )
            {
                ready = false;
                this.bundle.add(info.program.fragment, true);
            }

            if( !ready )
            {
                this.onProcessed(true);
                return;
            }
        }

        var newPass = {};

        if( info.program )
        {
            newPass.program = window.gr.createProgram(vertex, fragment);
        }

        this.passes.push(newPass);
        this.parsed.passes.shift();
    }

    this.onProcessed();
};

MaterialAsset.prototype.bind = function(index) {
    if( index === undefined || this.passes.length <= index )
    {
        return;
    }

    var pass = this.passes[index];

    if( pass.program )
    {
        window.gr.useProgram(pass.program);
    }
};