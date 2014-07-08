function CollisionDebugSystem(sm, em) {
    this.sm = sm;
    this.em = em;

    this.colliders = ColliderComponent.prototype.stack;

    this.camera = null;
}

CollisionDebugSystem.prototype = new SystemPrototype("collisionDebug", false, true);

CollisionDebugSystem.prototype.configure = function(bp) {
    
};

CollisionDebugSystem.prototype.initialize = function() {
    this.aabbModel = window.asset.get("models/test/aabb.oml");
    this.aabbMaterial = window.asset.get("materials/test/blue.mtrl");

    this.renderEntity = this.em.createEntity();
    this.renderEntity.addComponent(TransformComponent);
};

CollisionDebugSystem.prototype.render = function() {
    var graphics = window.graphics;
    if(!graphics.enabled)return;

    var colliders = this.colliders;
    var colliderCount = colliders.length;
    if(!colliderCount)return;
    
    for( var i = 0; i < colliderCount; i++ )
    {
        var collider = colliders[i];
        if( collider.entity )
        {
            var model = this.aabbModel;
            var material = this.aabbMaterial;

            var transform = this.renderEntity.transform;
            transform.position[0] = collider.aabb.c[0];
            transform.position[1] = collider.aabb.c[1];
            transform.position[2] = collider.aabb.c[2];
            transform.scale[0] = collider.aabb.e[0];
            transform.scale[1] = collider.aabb.e[1];
            transform.scale[2] = collider.aabb.e[2];
            transform.update();

            graphics.newState();
            
            var position = graphics.pushMatrix(transform.matrix);
            graphics.pushMultiply(1, position);
            var passCount = material.passes.length;
            for( var j = 0; j < passCount; j++ )
            {
                graphics.draw(model.vertexBuffer.id, model.indexBuffer.id, material.passes[j].program.id, j);
            }

            graphics.popMatrix();
        }
    }
};