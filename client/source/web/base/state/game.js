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

    this.render = new RenderProcessor();

    this.gameAssetBundle = window.asset.createBundle();
    this.gameAssetBundle.add("models/test/test.oml", true);
    this.gameAssetBundle.load(this.onBundleLoaded, this.onBundleProgress);
};

GameState.prototype.onBundleProgress = function(loaded, total) {
    
};

GameState.prototype.onBundleLoaded = function() {
    
    this.machine.onStateLoaded(this);
};

GameState.prototype.show = function() {
    this.visible = true;

    window.ui.appendChild(this.fragment);

    var entity = this.em.createEntity();
    var transform = entity.addComponent(TransformComponent);
    var model = entity.addComponent(ModelComponent);
    model.model = window.asset.get("models/test/test.oml");
    model.material = window.asset.get("materials/test/test.mtrl");
    this.entity = entity;
    vec3.set(transform.position, 0, 0, 0);
    vec3.set(transform.scale, 0.25, 0.25, 0.25);

    this.camera = this.em.createEntity();
    transform = this.camera.addComponent(TransformComponent);
    var camco = this.camera.addComponent(CameraComponent).activate();
    vec3.set(transform.position, 0, 0, 10);

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

        var transform = this.entity.getComponent(TransformComponent);
        quat.rotateX(transform.rotation, transform.rotation, 0.001);

        this.render.update(dt);
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