function AssetBundle(manager) {
    this.onCalculated = this.onCalculated.bind(this);
    this.onLoaded = this.onLoaded.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);

    this.files = [];
    this.manager = manager;
    this.current = 0;

    this.size = 0;
    this.fill = 0;

    this.loading = false;
    this.calculating = false;

    this.calculated = false;
    this.loaded = false;

    this.req = new XMLHttpRequest();
    this.req.responseType = "blob";
}

AssetBundle.prototype.formats = {

};

AssetBundle.prototype.add = function(file) {
    var path = file;
    if( path.substring(0, 1) !== "/" && path.indexOf("://") === -1 )
    {
        path = "data/" + path;
    }

    this.files.push({
        file: file,
        path: path,
        size: 0
    });
};

AssetBundle.prototype.load = function(loadCallback, progressCallback) {
    if( this.loading )
    {
        return false;
    }

    this.loading = true;

    this.loadCallback = loadCallback;
    this.progressCallback = progressCallback;
    
    this.loadNext();

    return true;
};

AssetBundle.prototype.calculate = function(calculatedCallback) {
    if( this.loading )
    {
        return false;
    }

    this.loading = true;
    this.calculating = true;

    this.calculatedCallback = calculatedCallback;

    this.calculateNext();
};

AssetBundle.prototype.calculateNext = function() {
    if( this.current >= this.files.length )
    {
        this.current = 0;
        this.calculated = true;

        if( this.calculating )
        {
            this.calculating = false;
            this.loading = false;

            if( this.calculatedCallback )
            {
                this.calculatedCallback(this.size);
                this.calculatedCallback = null;
            }

            return;
        }

        this.loadNext();
    }

    this.req.addEventListener("load", this.onCalculated, false);
    this.req.addEventListener("error", this.onError, false);

    this.req.open("GET", this.files[this.current].path, true);
    this.req.send();
};

AssetBundle.prototype.onError = function(event) {

};

AssetBundle.prototype.onCalculated = function(event) {
    this.req.removeEventListener("load", this.onCalculated);
    this.req.removeEventListener("error", this.onError);

    this.files[this.current].size = parseInt(this.req.getResponseHeader("Content-Length")) || 0;
    this.size += this.files[this.current].size;
    this.current++;
    this.calculateNext();
};

AssetBundle.prototype.loadNext = function() {
    this.req.addEventListener("progress", this.onProgress, false);
    this.req.addEventListener("load", this.onLoaded, false);
    this.req.addEventListener("error", this.onError, false);

    this.req.open("GET", this.files[this.current].path);
    this.req.send();
};

AssetBundle.prototype.onLoaded = function(event) {
    this.req.removeEventListener("progress", this.onProgress);
    this.req.removeEventListener("load", this.onLoaded);
    this.req.removeEventListener("error", this.onError);

    var info = this.files[this.current];
    this.fill += info.size;
    
    var lio = info.file.lastIndexOf(".");
    var ext = info.file.substring(lio+1, info.file.length);

    if( this.formats[ext] )
    {
        var asset = new this.formats[ext](ext, this.req.response);
        this.manager.register(info.file, asset);
    }

    this.current++;
    if( this.current >= this.files.length && this.loadCallback )
    {
        this.loading = false;
        this.loaded = true;

        this.loadCallback();
        this.loadCallback = null;
        this.progressCallback = null;

        return;
    }

    this.loadNext();
};

AssetBundle.prototype.onProgress = function(event) {
    if( event.lengthComputable && this.progressCallback )
    {
        if( this.calculated )
        {
            this.progressCallback(( this.fill + event.loaded ), this.size);
        }
        else
        {
            this.progressCallback(this.current, this.files.length);
        }
    }
};

function AssetPrototype() {

}

AssetPrototype.prototype.process = function(callback) {
    this.processedCallback = callback;

    this.subProcess();
};
AssetPrototype.prototype.subProcess = function(){};
AssetPrototype.prototype.processed = function() {
    if( this.processedCallback )
    {
        this.processedCallback();
    }
};

function AssetManager() {
    this.registry = {};
}

AssetManager.prototype.createBundle = function() {
    return new AssetBundle(this);
};

AssetManager.prototype.register = function(path, asset) {
    this.registry[path] = asset;
};

AssetManager.prototype.get = function(path) {
    if( this.registry[path] )
    {
        return this.registry[path];
    }

    return null;
};