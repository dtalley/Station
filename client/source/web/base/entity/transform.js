function TransformComponent() {
    this.position = vec3.create();
    this.scale = vec3.set(vec3.create(), 1, 1, 1);
    this.rotation = quat.identity(quat.create());

    this.smx = mat4.create();

    this.matrix = mat4.create();
}

TransformComponent.prototype = new ComponentPrototype(TransformComponent);
TransformComponent.prototype.type = "transform";

TransformComponent.prototype.update = function() {
    mat4.fromRotationTranslation(this.matrix, this.rotation, this.position);
    mat4.scale(this.matrix, this.matrix, this.scale);
};