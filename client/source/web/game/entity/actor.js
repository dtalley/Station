function ActorComponentShared() {
    this.movement = vec4.fromValues(0, 0, 0, 1);
    this.result = vec4.fromValues(0, 0, 0, 1);

    this.grabShape = new ColliderComponent.Sphere(0, 0, -1, 0, 0, -0.1, Math.PI / 2);
    this.deployShape = new ColliderComponent.Box(0, 0, -1, 0.5, 0.5, 0.5);

    this.queryAABB = new aabb();

    this.cursor = window.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0.5, 0.5, 0.5)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/cube.oml"),
        material: window.asset.get("materials/test/green.mtrl"),
        //visible: false
    });
}

ActorComponentShared.prototype = new ComponentPool(ActorComponent, "actor");

function ActorComponent() {
    ComponentPrototype.call(this);

    this.player = false;
    this.using = false;

    this.holding = null;
    this.targeting = null;
    this.container = null;

    this.moveSpeed = window.app.step * 0.005;
}

ActorComponent.prototype = new ActorComponentShared();

ActorComponent.prototype.onAttached = function() {

};

ActorComponent.prototype.onDetached = function() {
    
};

ActorComponent.prototype.configure = function(options) {
    if(!options) options = {};

    this.player = !!options.player;
    this.broadphase = options.broadphase;
    this.emitter = options.emitter;

    return this;
};

ActorComponent.prototype.update = function() {
    var transform = this.entity.transform;
    var input = this.entity.input;
    var updated = false;
    
    if(input.mouse[1])
    {
        quat.rotateY(transform.rotation, transform.rotation, input.view[0] * -1);
        updated = true;
    }

    if(input.direction[0] !== 0 || input.direction[2] !== 0)
    {
        vec4.transformQuat(this.movement, input.direction, transform.rotation);
        vec4.scale(this.movement, this.movement, this.moveSpeed);
        vec4.add(transform.position, transform.position, this.movement);
        updated = true;
    }

    if(updated) transform.update();

    if( this.player )
    {
        this.updatePlayer();
    }
};

ActorComponent.prototype.updatePlayer = function() {
    if( this.using )
    {
        if(!this.entity.input.actions[0])
        {
            this.using = false;
        }
    }

    var transform = this.entity.transform;

    if( this.holding )
    {
        this.deployShape.calculateAABB(this.queryAABB, transform.matrix);
        this.broadphase.query(this.queryAABB, DynamicSystem.Container, this.handlePlayerContainerQueryResult, this);

        if( this.entity.input.actions[0] && !this.using )
        {
            var holdingTransform = this.holding.entity.transform;

            this.holding.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            holdingTransform.detach();
            this.holding = null;
            this.using = true;
            this.cursor.model.visible = false;
            transform.removeChild(this.cursor.transform);
        }
        else if( this.entity.input.mouse[0] && !this.using )
        {
            this.emitter.emit("deploy", this.holding);

            this.holding = null;
            this.using = true;
            this.cursor.model.visible = false;
            transform.removeChild(this.cursor.transform);       
        }
        else
        {
            return;
        }
    }

    this.grabShape.calculateAABB(this.queryAABB, transform.matrix);
    this.broadphase.query(this.queryAABB, DynamicSystem.Usable, this.handlePlayerUsableQueryResult, this);
};

ActorComponent.prototype.handlePlayerContainerQueryResult = function(collider, empty) {
    var transform = this.entity.transform, cursorTransform = this.cursor.transform;

    if( empty )
    {
        if( this.cursor.transform.parent !== transform )
        {
            transform.addChild(cursorTransform);
            cursorTransform.position[0] = 0;
            cursorTransform.position[1] = -0.375;
            cursorTransform.position[2] = -1;
        }
        return;
    }

    var colliderTransform = collider.entity.transform;

    if( cursorTransform.parent !== colliderTransform )
    {
        colliderTransform.addChild(cursorTransform);
    }
};

ActorComponent.prototype.handlePlayerUsableQueryResult = function(collider, empty) {
    if( empty )
    {
        if( this.targeting )
        {
            this.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            this.targeting = null;
        }
        return;
    }

    var deployable = collider.entity.getComponent(DeployableComponent);

    if( deployable )
    {
        var dynamicTransform = deployable.entity.transform;

        if(this.targeting === deployable)
        {
            if(this.entity.input.actions[0] && !this.using)
            {
                this.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
                this.targeting = null;       

                this.holding = deployable;
                this.holding.entity.model.material = window.asset.get("materials/test/blue.mtrl");

                dynamicTransform.position[0] = 0;
                dynamicTransform.position[1] = 0;
                dynamicTransform.position[2] = -0.8;
                quat.identity(dynamicTransform.rotation, dynamicTransform.rotation);
                this.entity.transform.addChild(dynamicTransform);

                this.using = true;

                this.cursor.model.visible = true;
                this.entity.transform.addChild(this.cursor.transform);
                this.cursor.transform.position[0] = 0;
                this.cursor.transform.position[1] = -0.375;
                this.cursor.transform.position[2] = -1;
                this.cursor.transform.scale[0] = 1;
                this.cursor.transform.scale[1] = 0.25;
                this.cursor.transform.scale[2] = 1;
                this.cursor.transform.update();

                console.log(this.cursor);
            }

            return false;
        }
        else if(this.targeting)
        {
            this.targeting.entity.model.material = window.asset.get("materials/test/gray.mtrl");
            this.targeting = null;
        }

        this.targeting = deployable;
        this.targeting.entity.model.material = window.asset.get("materials/test/green.mtrl");

        return false;
    }

    return true;
};