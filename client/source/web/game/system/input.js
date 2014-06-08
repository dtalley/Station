function InputSystem() {
    SystemPrototype.call(this);
    
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);

    this.keys = new Uint8Array(268);
    for( var i = 0; i < 268; i++, this.keys[i] = 0 );

    this.stack = InputComponent.prototype.stack;
    
    this.pointer = vec2.fromValues(0, 0);
    this.lastPointer = vec2.fromValues(0, 0);
    this.movement = vec2.fromValues(0, 0);

    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;

    window.onmousedown = this.onMouseDown;
    window.onmouseup = this.onMouseUp;
    window.oncontextmenu = this.onContextMenu;

    window.onmousemove = this.onMouseMove;

    this.skipMovement = 0;
}

InputSystem.prototype = new SystemPrototype();

InputSystem.prototype.update = function() {
    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven)
        {
            if( !this.skipMovement )
            {
                c.handle(InputSystem.MouseX, this.movement[0]);
                c.handle(InputSystem.MouseY, this.movement[1]);
            }
            else
            {
                this.skipMovement--;
            }

            if( !this.mouseLocked )
            {
                c.pointer[0] = ( ( this.pointer[0] << 1 ) / window.innerWidth ) - 1;
                c.pointer[1] = 1 - ( ( this.pointer[1] << 1 ) / window.innerHeight );
            }
        }
    }

    this.movement[0] = 0;
    this.movement[1] = 0;

    this.lastPointer[0] = this.pointer[0];
    this.lastPointer[1] = this.pointer[1];
};

InputSystem.prototype.set = function(code) {
    if(this.keys[code])return;

    this.keys[code] = 1;

    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven) c.handle(code, 1);
    }
};

InputSystem.prototype.unset = function(code) {
    if(!this.keys[code])return;

    this.keys[code] = 0;

    var count = this.stack.length;
    for( var i = 0; i < count; i++ )
    {
        var c = this.stack[i];
        if(c.entity && c.driven) c.handle(code, -1);
    }
};

InputSystem.prototype.onKeyDown = function(event) {
    //console.log(event.keyCode);
    this.set(event.keyCode);
    event.preventDefault();
};

InputSystem.prototype.onKeyUp = function(event) {
    this.unset(event.keyCode);
    event.preventDefault();
};

InputSystem.prototype.onContextMenu = function(event) {
    event.preventDefault();
};

InputSystem.prototype.onMouseDown = function(event) {
    if(event.which === 3)
    {
        document.documentElement.webkitRequestPointerLock();
        this.skipMovement = 3;
    }

    this.set(256+event.which);

    event.preventDefault();
};

InputSystem.prototype.onMouseUp = function(event) {
    if(event.which === 3)
    {
        document.webkitExitPointerLock();
        this.skipMovement = 3;
    }

    this.unset(256+event.which);

    event.preventDefault();
};

InputSystem.prototype.isActive = function(code) {
    if(code>268)return 0;
    return this.keys[code];
};

InputSystem.prototype.onMouseMove = function(event) {
    this.movement[0] += event.movementX;
    this.movement[1] += event.movementY;

    this.pointer[0] = event.x;
    this.pointer[1] = event.y;

    event.preventDefault();
};

//Constants
InputSystem.MouseButton1 = 257;
InputSystem.MouseButton2 = 259;
InputSystem.MouseButton3 = 258;

InputSystem.MouseX = 260;
InputSystem.MouseY = 261;

InputSystem.JoystickXPositive = 264;
InputSystem.JoystickXNegative = 265;
InputSystem.JoystickYPositive = 266;
InputSystem.JoystickYNegative = 267;