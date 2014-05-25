function AssetBundle(manager) {
    this.onCalculated = this.onCalculated.bind(this);
    this.onLoaded = this.onLoaded.bind(this);
    this.onProcessed = this.onProcessed.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);

    this.assets = [];
    this.manager = manager;
    this.current = 0;

    this.size = 0;
    this.fill = 0;

    this.loading = false;
    this.calculating = false;

    this.calculated = false;
    this.loaded = false;

    this.req = new XMLHttpRequest();
    this.req.responseType = "arraybuffer";
}

AssetBundle.prototype.formats = {

};

AssetBundle.prototype.defer = function(asset) {
    asset.processOnLoad = true;
    this.assets.push(asset);
};

AssetBundle.prototype.add = function(file, processOnLoad) {
    var asset;
    if( ( asset = this.manager.get(file) ) )
    {
        this.push(asset);
        return;
    }

    var path = file;
    if( path.substring(0, 1) !== "/" && path.indexOf("://") === -1 )
    {
        path = "data/" + path;
    }

    var lio = file.lastIndexOf(".");
    var ext = file.substring(lio+1, file.length);

    if( !this.formats[ext] )
    {
        throw new Error("Attempt to load invalid asset type: " + ext);
    }

    asset = new this.formats[ext](this, path, ext, processOnLoad);
    this.manager.register(file, asset);

    this.assets.push(asset);

    return asset;
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
    if( this.current >= this.assets.length )
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

    this.req.open("GET", this.assets[this.current].path, true);
    this.req.send();
};

AssetBundle.prototype.onError = function(event) {

};

AssetBundle.prototype.onCalculated = function(event) {
    this.req.removeEventListener("load", this.onCalculated);
    this.req.removeEventListener("error", this.onError);

    this.assets[this.current].size = parseInt(this.req.getResponseHeader("Content-Length")) || 0;
    this.size += this.assets[this.current].size;
    this.current++;
    this.calculateNext();
};

AssetBundle.prototype.loadNext = function() {
    if( this.assets[this.current].loaded )
    {
        this.onLoaded();
        return;
    }
    
    this.req.addEventListener("progress", this.onProgress, false);
    this.req.addEventListener("load", this.onLoaded, false);
    this.req.addEventListener("error", this.onError, false);

    this.req.open("GET", this.assets[this.current].path);
    this.req.send();
};

AssetBundle.prototype.onLoaded = function(event) {
    this.req.removeEventListener("progress", this.onProgress);
    this.req.removeEventListener("load", this.onLoaded);
    this.req.removeEventListener("error", this.onError);

    var asset = this.assets[this.current];
    asset.data = this.req.response;
    asset.size = asset.data.length;
    this.fill += asset.size;

    asset.onLoaded(this.onProcessed);
};

AssetBundle.prototype.onProcessed = function(asset) {
    if( asset )
    {
        asset.off("processed", this);
    }
    
    this.current++;
    if( this.current >= this.assets.length && this.loadCallback )
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
            this.progressCallback(this.current, this.assets.length);
        }
    }
};

function AssetPrototype(bundle, path, ext, processOnLoad) {
    this.bundle = bundle;
    this.path = path;
    this.ext = ext;
    this.data = null;
    this.processOnLoad = processOnLoad;
    this.size = 0;
    
    this.loaded = false;
    this.processed = false;
    this.processing = false;
}

AssetPrototype.prototype.onLoaded = function(processCallback) {
    this.loaded = true;
    if( this.processOnLoad )
    {
        this.process(processCallback);
        return;
    }

    processCallback();
};

AssetPrototype.prototype.process = function(processCallback) {
    this.processCallback = processCallback;

    if( this.processing ) return;

    this.processing = true;
    this.subProcess();

    return this;
};
AssetPrototype.prototype.subProcess = function(){};
AssetPrototype.prototype.onProcessed = function(defer) {
    if( defer )
    {
        this.bundle.defer(this);
    }
    else
    {
        this.processed = true;
    }
    this.processing = false;
    
    if( this.processCallback )
    {
        this.processCallback();
    }
};

AssetPrototype.prototype.readText = function(data) {
    return String.fromCharCode.apply(null, new Uint8Array(data));
};

function AssetManager() {
    this.registry = {};
}

AssetManager.prototype.createBundle = function() {
    return new AssetBundle(this);
};

AssetManager.prototype.register = function(path, asset) {
    this.registry[path] = asset;
    return asset;
};

AssetManager.prototype.get = function(path) {
    if( this.registry[path] )
    {
        return this.registry[path];
    }

    return null;
};