function WorldSystem(em) {
    this.em = em;

    this.render = this.addProcessor(new RenderProcessor());
}

WorldSystem.prototype = new SystemPrototype();