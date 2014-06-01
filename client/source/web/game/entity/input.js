function InputComponent() {
    this.direction = new Int8Array(2);
    this.direction[0] = 0;
    this.direction[1] = 0;

    this.view = new Int8Array(2);
    this.view[0] = 0;
    this.view[1] = 0;

    this.pointer = new Float32Array(2);
    this.pointer[0] = 0;
    this.pointer[1] = 0;

    this.mouse = new Int8Array(3);
    this.mouse[0] = 0;
    this.mouse[1] = 0;
    this.mouse[2] = 0;

    this.viewSensitivity = 1;

    this.dxp = 68;
    this.dxn = 65;
    this.dyp = 83;
    this.dyn = 87;

    this.vxp = InputProcessor.MouseXPositive;
    this.vxn = InputProcessor.MouseXNegative;
    this.vyp = InputProcessor.MouseYPositive;
    this.vyn = InputProcessor.MouseYNegative;

    this.driven = false;
}

InputComponent.prototype = new ComponentPrototype(InputComponent);

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
        case this.dyp:
            this.direction[1] += d;
            break;
        case this.dyn:
            this.direction[1] -= d;
            break;

        case this.vxp:
            this.view[0] += d * this.viewSensitivity;
            break;
        case this.vxn:
            this.view[0] -= d * this.viewSensitivity;
            break;
        case this.vyp:
            this.view[1] += d * this.viewSensitivity;
            break;
        case this.vyn:
            this.view[1] -= d * this.viewSensitivity;
            break;

        case InputProcessor.MouseButton1:
            this.mouse[0] += d;
            break;

    }
};

InputComponent.prototype.onDetached = function() {
    this.entity.input = null;
};