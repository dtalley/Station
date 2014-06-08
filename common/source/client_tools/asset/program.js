AssetBundle.prototype.formats.prog = ProgramAsset;

function ProgramAsset(ext, contents) {
    this.createProgram = this.createProgram.bind(this);

    this.ext = ext;
    this.contents = contents;
    this.program = null;
}

ProgramAsset.prototype = new AssetPrototype();

ProgramAsset.prototype.subProcess = function() {
    var ready = true;

    if( !this.contents.vertex.processed )
    {
        ready = false;
        this.contents.vertex.on("processed", this.createProgram, this);
        this.contents.fragment.process();
    }

    if( !this.contents.fragment.processed )
    {
        ready = false;
        this.contents.fragment.on("processed", this.createProgram, this);
        this.contents.fragment.process();
    }

    if( ready )
    {
        this.createProgram();
    }
};

ProgramAsset.prototype.createProgram = function() {
    if( !this.contents.vertex.processed || !this.contents.fragment.processed )
    {
        return;
    }

    this.contents.fragment.off("processed", this);
    this.contents.vertex.off("processed", this);

    this.program = window.gr.createProgram(this.contents.vertex, this.contents.fragment);

    this.onProcessed();
};

ProgramAsset.prototype.bind = function() {
    if( this.program )
    {
        window.gr.useProgram(this);
    }
};