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

    this.renderer = new RenderProcessor();
    this.interior = new InteriorProcessor(this.em);
    this.input = new InputProcessor();
    
    this.machine.onStateLoaded(this);
};

GameState.prototype.show = function() {
    this.visible = true;

    window.ui.appendChild(this.fragment);

    this.player = this.em.createEntity();
    this.player.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0, 0.5, 0)
    });
    this.player.addComponent(InputComponent).configure({
        driven: true
    });
    this.player.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/arrow.oml"),
        material: window.asset.get("materials/test/red.mtrl")
    });
    this.player.addComponent(Interior.DynamicComponent).configure({
        character: true,
        player: true,
        size: 1
    });

    this.camera = this.em.createEntity();
    this.camera.addComponent(CameraComponent).activate();
    this.camera.addComponent(TransformComponent).configure({
        parent: this.player.getComponent(TransformComponent),
        position: vec3.fromValues(0, 40, 20),
        rotation: quat.rotateX(quat.create(), quat.zero, -63 * Math.PI / 180),
        watcher: this.camera.getComponent(CameraComponent)
    });
};

GameState.prototype.subDestroy = function() {
    window.ui.removeChild(this.holder);
};

GameState.prototype.simulate = function() {
    if( this.visible )
    {
        this.input.start();
        this.interior.start();
    }
};

GameState.prototype.render = function() {
    if( this.visible )
    {
        this.renderer.start();
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