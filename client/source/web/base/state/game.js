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
    this.gameAssetBundle.add("materials/test/red.mtrl", true);
    this.gameAssetBundle.add("materials/test/green.mtrl", true);
    this.gameAssetBundle.add("materials/test/blue.mtrl", true);
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

    this.player = this.em.createEntity();
    this.player.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 1, 0)
    });
    this.player.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/test.oml"),
        material: window.asset.get("materials/test/red.mtrl")
    });

    this.camera = this.em.createEntity();
    var transform = this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 10, 20)
    });
    quat.rotateX(transform.rotation, transform.rotation, -30 * Math.PI / 180);
    this.camera.addComponent(CameraComponent).activate().update();

    for( var x = -10; x <= 10; x++ )
    {
        for( var y = -10; y <= 10; y++ )
        {
            var box = this.em.createEntity();
            box.addComponent(TransformComponent).configure({
                position: vec3.fromValues(x*2, 0, y*2),
                scale: vec3.fromValues(0.9, 0.01, 0.9)
            });
            box.addComponent(ModelComponent).configure({
                model: window.asset.get("models/test/test.oml"),
                material: window.asset.get("materials/test/blue.mtrl")
            });
        }
    }
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

        /*var transform = this.player.getComponent(TransformComponent);
        quat.rotateX(transform.rotation, transform.rotation, 0.0001 * dt);
        this.camera.getComponent(CameraComponent).update();*/

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