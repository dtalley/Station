function InputComponent(flags) {
    ComponentPrototype.call(this, flags);
    
    this.direction = vec4.fromValues(0, 0, 0, 1);

    this.view = vec2.fromValues(0, 0);
    this.pointer = vec2.fromValues(0, 0);

    this.mouse = new Int8Array(3);
    this.mouse[0] = 0;
    this.mouse[1] = 0;
    this.mouse[2] = 0;

    this.actions = new Int8Array(5);
    this.actions[0] = 0;
    this.actions[1] = 0;
    this.actions[2] = 0;
    this.actions[3] = 0;
    this.actions[4] = 0;

    this.viewSensitivity = 0.005;

    this.dxp = 68;
    this.dxn = 65;
    this.dyp = 0;
    this.dyn = 0;
    this.dzp = 83;
    this.dzn = 87;

    this.vx = InputSystem.MouseX;
    this.vy = InputSystem.MouseY;
    this.vz = InputSystem.MouseZ;

    this.use = 69;

    this.driven = false;
}

InputComponent.prototype = new ComponentPool(InputComponent, "input");

InputComponent.prototype.onAttached = function() {
    this.entity.input = this;
};

InputComponent.prototype.handle = function(code, d) {
    switch(code) {
        case this.dxp:
            this.direction[0] += d;
            break;
        case this.dxn:
            this.direction[0] -= d;
            break;
        case this.dzp:
            this.direction[2] += d;
            break;
        case this.dzn:
            this.direction[2] -= d;
            break;

        case this.vx:
            this.view[0] = d * this.viewSensitivity;
            break;
        case this.vy:
            this.view[1] = d * this.viewSensitivity;
            break;

        case InputSystem.MouseButton1:
            this.mouse[0] += d;
            break;
        case InputSystem.MouseButton2:
            this.mouse[1] += d;
            break;
        case InputSystem.MouseButton3:
            this.mouse[2] += d;
            break;

        case this.use:
            this.actions[0] += d;
            break;
    }
};

InputComponent.prototype.onDetached = function() {
    this.entity.input = null;
};