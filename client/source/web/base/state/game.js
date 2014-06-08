function GameState() {
    this.onGameLoaded = this.onGameLoaded.bind(this);
    this.onGameProgress = this.onGameProgress.bind(this);
    this.onBundleProgress = this.onBundleProgress.bind(this);
    this.onBundleLoaded = this.onBundleLoaded.bind(this);

    this.visible = false;
    this.fps = 0;
    this.fragment = null;
    this.holder = null;
}

GameState.prototype = new StatePrototype();

GameState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
    this.holder.id = "game";

    this.fragment.appendChild(this.holder);

    window.app.loadScript("game.js", this.onGameLoaded, this.onGameProgress);
};

GameState.prototype.onGameProgress = function(loaded, total) {

};

GameState.prototype.onGameLoaded = function() {
    this.gameAssetBundle = window.asset.createBundle();
    this.gameAssetBundle.add("models/test/cube.oml", true);
    this.gameAssetBundle.add("models/test/arrow.oml", true);
    this.gameAssetBundle.add("materials/test/color.mtrl", true);
    this.gameAssetBundle.add("materials/test/red.mtrl", true);
    this.gameAssetBundle.add("materials/test/green.mtrl", true);
    this.gameAssetBundle.add("materials/test/blue.mtrl", true);
    this.gameAssetBundle.add("materials/test/gray.mtrl", true);
    this.gameAssetBundle.load(this.onBundleLoaded, this.onBundleProgress);
};

GameState.prototype.onBundleProgress = function(loaded, total) {
    
};

GameState.prototype.onBundleLoaded = function() {
    this.em = new EntityManager();
    this.sp = new DynamicAABBTree();

    this.renderer = new RenderSystem(this.sp);
    this.dynamic = new DynamicSystem(this.em, this.sp);
    this.input = new InputSystem();
    
    this.machine.onStateLoaded(this);
};

GameState.prototype.show = function() {
    this.visible = true;

    window.ui.appendChild(this.fragment);
};

GameState.prototype.subDestroy = function() {
    window.ui.removeChild(this.holder);
};

GameState.prototype.simulate = function() {
    if( this.visible )
    {
        this.input.update();
        this.dynamic.update();
    }
};

GameState.prototype.render = function() {
    if( this.visible )
    {
        this.renderer.update();
    }
};

GameState.prototype.handleMessage = function(message) {
    switch(message.id)
    {
        default:
            return false;
    }

    return true;
};

GameState.prototype.handleConnect = function(type) {
    return false;
};