function WorldSystem(canvas) {
    this.render = this.addProcessor(new RenderProcessor());
}

WorldSystem.prototype = new SystemPrototype();