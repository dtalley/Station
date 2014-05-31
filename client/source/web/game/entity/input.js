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

    this.viewSensitivity = 1;

    this.dxp = 68;
    this.dxn = 65;
    this.dyp = 83;
    this.dyn = 87;

    this.vxp = this.MouseXPositive;
    this.vxn = this.MouseXNegative;
    this.vyp = this.MouseYPositive;
    this.vyn = this.MouseYNegative;

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
    }
};

InputComponent.prototype.onDetached = function() {
    this.entity.input = null;
};