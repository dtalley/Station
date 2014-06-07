function EditorProcessor(em) {
    this.em = em;
    this.mv = vec3.create();

    this.containers = Interior.ContainerComponent.prototype.stack;
    this.dynamics = Interior.DynamicComponent.prototype.stack;

    this.cursor = this.em.createEntity();
    this.cursor.addComponent(TransformComponent).configure({
        position: vec3.fromValues(0.5, 0.5, 0.5)
    });
    this.cursor.addComponent(ModelComponent).configure({
        model: window.asset.get("models/test/test.oml"),
        material: window.asset.get("materials/test/green.mtrl")
    });

    this.position = vec4.create();
    this.ray = vec4.create();
    this.ground = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
    this.origin = vec4.fromValues(0, 0, 0, 1.0);
    this.result = 0.0;

    this.dragStart = vec2.fromValues(0, 0);
    this.dragState = this.DragNone;

    this.editing = true;
    this.editState = this.EditStrut;

    this.scaleAdd = 0;
}

EditorProcessor.prototype = new ProcessorPrototype();

EditorProcessor.prototype.DragNone = 0;
EditorProcessor.prototype.DragWallX = 1;
EditorProcessor.prototype.DragWallY = 2;
EditorProcessor.prototype.DragColumn = 3;
EditorProcessor.prototype.DragBlock = 4;

EditorProcessor.prototype.EditWall = 0;
EditorProcessor.prototype.EditStrut = 1;
EditorProcessor.prototype.EditDuct = 2;
EditorProcessor.prototype.EditFloor = 3;
EditorProcessor.prototype.EditProp = 4;

EditorProcessor.prototype.update = function() {
    var dynamic;
    count = this.dynamics.length;
    for( i = 0; i < count; i++ )
    {
        dynamic = this.dynamics[i];
        if(!dynamic.entity) continue;

        if(dynamic.character)
        {
            var input = dynamic.entity.input;

            if( input.direction[0] || input.direction[1] )
            {
                vec3.set(this.mv, window.app.step * 0.01 * input.direction[0], 0, window.app.step * 0.01 * input.direction[1]);
                vec3.add(dynamic.entity.transform.position, dynamic.entity.transform.position, this.mv);
                dynamic.entity.transform.update();

                if(dynamic.player)
                {
                    if(dynamic.container)
                    {
                        this.generateChunks(dynamic);
                    }
                }
            }

            if( input.driven && dynamic.player && CameraComponent.active )
            {
                this.position[0] = input.pointer[0];
                this.position[1] = input.pointer[1];
                this.position[2] = 0;
                this.position[3] = 1;

                vec4.transformMat4(this.position, this.position, CameraComponent.active.revert);

                this.position[0] /= this.position[3];
                this.position[1] /= this.position[3];
                this.position[2] /= this.position[3];

                this.position[0] -= CameraComponent.active.position[0];
                this.position[1] -= CameraComponent.active.position[1];
                this.position[2] -= CameraComponent.active.position[2];
                this.position[3] = 1;

                //Do dot product, if it equals 0, the mouse didn't touch the ground plane

                //(p0-l0).n / l.n
                this.result = ( vec3.dot(vec4.subtract(this.ray, this.origin, CameraComponent.active.position), this.ground) ) / ( vec3.dot(this.position, this.ground) );

                vec4.add(this.position, CameraComponent.active.position, vec4.scale(this.position, this.position, this.result));

                var posX = Math.floor(this.position[0]);
                var posY = Math.floor(this.position[2]);

                var xleft = this.position[0] - posX;
                var ytop = this.position[2] - posY;

                if(this.dragState === this.DragNone)
                {
                    this.cursor.transform.position[0] = posX + 0.5;
                    this.cursor.transform.position[2] = posY + 0.5;

                    this.dragStart[0] = posX;
                    this.dragStart[1] = posY;
                }

                if(this.editState === this.EditWall)
                {
                    this.editWall(input, posX, posY, xleft, ytop);
                }
                else if(this.editState === this.EditStrut)
                {
                    this.editStrut(input, posX, posY, xleft, ytop);
                }

                if( this.dragState !== this.DragNone )
                {
                    this.doDrag(input, posX, posY, xleft, ytop);
                }

                this.cursor.transform.update();
            }
        }
    }
};

EditorProcessor.prototype.editStrut = function(input, posX, posY, xleft, ytop) {
    this.cursor.transform.position[1] = -0.125;

    this.cursor.transform.scale[0] = 1.0;
    this.cursor.transform.scale[1] = 0.25;
    this.cursor.transform.scale[2] = 1.0;

    this.scaleAdd = 0;

    if(this.dragState === this.DragNone)
    {
        if( input.mouse[0] )
        {
            this.dragState = this.DragBlock;
        }
    }
};

EditorProcessor.prototype.editWall = function(input, posX, posY, xleft, ytop) {
    this.cursor.transform.position[1] = 0.5;
    this.cursor.transform.scale[1] = 1.0;

    this.scaleAdd = 0.2;

    if(this.dragState === this.DragNone)
    {
        var state = this.DragBlock;

        if(xleft < 0.2 || xleft > 0.8)
        {
            this.cursor.transform.scale[0] = this.scaleAdd;
            this.cursor.transform.position[0] += Math.round(xleft) - 0.5;
            this.dragStart[0] += Math.round(xleft);
            state |= this.DragWallY;
            state &= ~this.DragBlock;
        }
        else
        {
            this.cursor.transform.scale[0] = 1.0 + this.scaleAdd;
        }

        if(ytop < 0.2 || ytop > 0.8)
        {
            this.cursor.transform.scale[2] = this.scaleAdd;
            this.cursor.transform.position[2] += Math.round(ytop) - 0.5;
            this.dragStart[1] += Math.round(ytop);
            state |= this.DragWallX;
            state &= ~this.DragBlock;
        }
        else
        {
            this.cursor.transform.scale[2] = 1.0 + this.scaleAdd;
        }

        if( input.mouse[0] )
        {
            this.dragState = state;
        }
    }
};

EditorProcessor.prototype.doDrag = function(input, posX, posY, xleft, ytop) {
    this.cursor.transform.position[0] = this.dragStart[0];
    this.cursor.transform.position[2] = this.dragStart[1];

    var width = posX - this.dragStart[0];
    if(width>=0)width++;
    if(width<0)width--;

    var height = posY - this.dragStart[1];
    if(height>=0)height++;
    if(height<0)height--;

    var widthScaled = false;
    var heightScaled = false;

    if(this.dragState === this.DragColumn)
    {
        if(Math.abs(this.position[0] - this.dragStart[0]) > Math.abs(this.position[2] - this.dragStart[1]))
        {
            widthScaled = true;
            this.cursor.transform.scale[2] = this.scaleAdd;
            if(width<0)
            {
                if(width<-1)this.cursor.transform.position[0] -= 1;
                width += 1;
            }
        }
        else
        {
            heightScaled = true;
            this.cursor.transform.scale[0] = this.scaleAdd;
            if(height<0)
            {
                if(height<-1)this.cursor.transform.position[2] -= 1;
                height += 1;
            }
        }
    }
    else
    {
        if(width===0) width = 1;
        if(height===0) height = 1;
    }

    if(this.dragState === this.DragBlock || this.dragState === this.DragWallX)
    {
        widthScaled = true;
    }

    if(this.dragState === this.DragBlock || this.dragState === this.DragWallY)
    {
        heightScaled = true;
    }

    if(widthScaled)
    {
        this.cursor.transform.scale[0] = Math.abs(width) + this.scaleAdd;
        this.cursor.transform.position[0] += width/2;
        if(width < 0)
        {
            this.cursor.transform.position[0] += 1;
        }
    }

    if(heightScaled)
    {
        this.cursor.transform.scale[2] = Math.abs(height) + this.scaleAdd;
        this.cursor.transform.position[2] += height/2;
        if(height < 0)
        {
            this.cursor.transform.position[2] += 1;
        }
    }

    if(input.mouse[0] === 0)
    {
        this.modifyContainer(posX, posY, width, height);
        this.dragState = this.DragNone;
    }
};

EditorProcessor.prototype.modifyContainer = function(posX, posY, width, height) {
    var sX = this.dragStart[0];
    if( width < 0 ) sX = posX;
    var sY = this.dragStart[1];
    if( height < 0 ) sY = posY;

    for( var i = 0; i < Math.abs(width); i++ )
    {
        for( var j = 0; j < Math.abs(height); j++ )
        {
            var strut = this.em.createEntity();
            strut.addComponent(TransformComponent).configure({
                position: vec3.fromValues(sX + i + 0.5, -0.125, sY + j + 0.5),
                scale: vec3.fromValues(1.0, 0.25, 1.0)
            });
            strut.addComponent(ModelComponent).configure({
                model: window.asset.get("models/test/test.oml"),
                material: window.asset.get("materials/test/blue.mtrl")
            });
        }
    }
};

EditorProcessor.prototype.generateChunks = function(dynamic) {
    var tx = Math.floor(dynamic.entity.transform.position[0]);
    var ty = Math.floor(dynamic.entity.transform.position[2]);

    if( !dynamic.spawned || tx !== dynamic.tile[0] || ty !== dynamic.tile[1] )
    {
        dynamic.spawned = true;
        dynamic.tile[0] = tx;
        dynamic.tile[1] = ty;

        var cx = tx >> dynamic.container.shift;
        var cy = ty >> dynamic.container.shift;
        
        this.generateChunk(dynamic.container, cx, cy);
        this.generateChunk(dynamic.container, cx+1, cy);
        this.generateChunk(dynamic.container, cx, cy+1);
        this.generateChunk(dynamic.container, cx-1, cy);
        this.generateChunk(dynamic.container, cx, cy-1);
        this.generateChunk(dynamic.container, cx+1, cy+1);
        this.generateChunk(dynamic.container, cx-1, cy-1);
        this.generateChunk(dynamic.container, cx+1, cy-1);
        this.generateChunk(dynamic.container, cx-1, cy+1);
    }
};

EditorProcessor.prototype.generateChunk = function(container, x, y) {
    if( x < 0 || x >= container.width || y < 0 || y >= container.height )
    {
        return;
    }

    var pos = x * container.height + y;
    var chunk = container.chunks[pos];
    if( chunk ) return;

    chunk = this.em.createEntity();
    container.chunks[pos] = chunk;
    chunk.addComponent(TransformComponent).configure({
        parent: container.entity.transform,
        position: vec3.set(this.mv, x*container.size, 0, y*container.size)
    });
    
    var size = container.size;
    var model = new ModelAsset();
    var verts = [];
    var idx = [];

    var total = container.size * container.size;
    for( var i = 0; i < total; i++ )
    {
        var col = Math.floor(i/container.size);
        var row = i % container.size;
        var xdist = Math.min(col, container.size-col);
        var ydist = Math.min(row, container.size-row);
        var dist = Math.min(xdist, ydist);
        var color = 1 - ( dist / ( container.size / 2 ) );
        var yper = row / container.size;
        verts = verts.concat([
            col * 1.0, 0.0, row * 1.0,
            0.3, 0.3, 0.3,
            col * 1.0, 0.0, row * 1.0 + 1.0,
            0.3, 0.3, 0.3,
            col * 1.0 + 1.0, 0.0, row * 1.0 + 1.0,
            0.3, 0.3, 0.3,
            col * 1.0 + 1.0, 0.0, row * 1.0,
            0.3, 0.3, 0.3
        ]);
        var str = i * 4;
        idx = idx.concat([
            str, str + 1, str + 2,
            str + 1, str + 2, str + 3
        ]);
    }
    
    model.vertices = new Float32Array(verts);
    model.indices = new Uint16Array(idx);
    model.attributes = [
        {
            name: "position",
            type: window.gr.Float,
            count: 3
        },
        {
            name: "color",
            type: window.gr.Float,
            count: 3
        }
    ];
    model.drawType = window.gr.Lines;
    model.createBuffers();
    
    chunk.addComponent(ModelComponent).configure({
        material: window.asset.get("materials/test/color.mtrl"),
        model: model
    });
};