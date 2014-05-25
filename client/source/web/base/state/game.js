function GameState() {
    this.onGameLoaded = this.onGameLoaded.bind(this);
    this.onGameProgress = this.onGameProgress.bind(this);
    this.onBundleProgress = this.onBundleProgress.bind(this);
    this.onBundleLoaded = this.onBundleLoaded.bind(this);

    this.visible = false;
}

GameState.prototype = new StatePrototype();

GameState.prototype.subLoad = function() {
    this.fragment = document.createDocumentFragment();
    this.holder = document.createElement("div");
    this.holder.id = "game";

    this.fps = document.createElement("div");
    this.fps.classList.add("fps");
    this.holder.appendChild(this.fps);

    this.fpsTotal = 0;
    this.fpsList = [];
    this.fpsCount = 0;

    this.fragment.appendChild(this.holder);

    window.app.loadScript("game.js", this.onGameLoaded, this.onGameProgress);
};

GameState.prototype.onGameProgress = function(loaded, total) {

};

GameState.prototype.onGameLoaded = function() {
    this.em = new EntityManager();

    this.world = new WorldSystem(this.em);

    this.gameAssetBundle = window.asset.createBundle();
    this.gameAssetBundle.add("shaders/test/test.vert");
    this.gameAssetBundle.add("shaders/test/test.frag");
    this.gameAssetBundle.load(this.onBundleLoaded, this.onBundleProgress);
};

GameState.prototype.onBundleProgress = function(loaded, total) {
    
};

GameState.prototype.onBundleLoaded = function() {
    window.asset.get("shaders/test/test.vert").process();
    window.asset.get("shaders/test/test.frag").process();

    this.machine.onStateLoaded(this);
};

GameState.prototype.show = function() {
    this.visible = true;

    window.ui.appendChild(this.fragment);

    this.machine.collapse();
};

GameState.prototype.subDestroy = function() {
    window.ui.removeChild(this.holder);
};

GameState.prototype.update = function(dt) {
    if( this.visible )
    {
        if( this.fpsList.length > 10 )
        {
            this.fpsTotal -= this.fpsList.shift();
            this.fpsCount--;
        }
        this.fpsList.push(dt);
        this.fpsTotal += dt;
        this.fpsCount++;

        var fps = 1000.0 * this.fpsCount / this.fpsTotal;
        this.fps.innerHTML = fps.toFixed(1) + "";

        this.world.update(dt);
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