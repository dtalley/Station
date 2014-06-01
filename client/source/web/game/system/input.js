function InputProcessor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);

    this.keys = new Uint8Array(268);
    for( var i = 0; i < 268; i++, this.keys[i] = 0 );

    this.stack = InputComponent.prototype.stack;

    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;

    window.onmousedown = this.onMouseDown;
    window.onmouseup = this.onMouseUp;
    window.oncontextmenu = this.onContextMenu;

    window.onmousemove = this.onMouseMove;
}

InputProcessor.prototype = new ProcessorPrototype();

InputProcessor.prototype.start = function() {

};

InputProcessor.prototype.set = function(code) {
    if(this.keys[code])return;

    this.keys[code] = 1;

    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven) c.handle(code, 1);
    }
};

InputProcessor.prototype.unset = function(code) {
    if(!this.keys[code])return;

    this.keys[code] = 0;

    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven) c.handle(code, -1);
    }
};

InputProcessor.prototype.onKeyDown = function(event) {
    this.set(event.keyCode);
    event.preventDefault();
};

InputProcessor.prototype.onKeyUp = function(event) {
    this.unset(event.keyCode);
    event.preventDefault();
};

InputProcessor.prototype.onContextMenu = function(event) {
    event.preventDefault();
};

InputProcessor.prototype.onMouseDown = function(event) {
    this.set(256+event.which);
};

InputProcessor.prototype.onMouseUp = function(event) {
    this.unset(256+event.which);
};

InputProcessor.prototype.isActive = function(code) {
    if(code>268)return 0;
    return this.keys[code];
};

InputProcessor.prototype.onMouseMove = function(event) {
    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven)
        {
            c.pointer[0] = ( ( event.x << 1 ) / window.innerWidth ) - 1;
            c.pointer[1] = 1 - ( ( event.y << 1 ) / window.innerHeight );
        }
    }
    event.preventDefault();
};

//Constants
InputProcessor.MouseButton1 = 257;
InputProcessor.MouseButton2 = 259;
InputProcessor.MouseButton3 = 258;

InputProcessor.MouseXPositive = 260;
InputProcessor.MouseXNegative = 261;
InputProcessor.MouseYPositive = 262;
InputProcessor.MouseYNegative = 263;

InputProcessor.JoystickXPositive = 264;
InputProcessor.JoystickXNegative = 265;
InputProcessor.JoystickYPositive = 266;
InputProcessor.JoystickYNegative = 267;