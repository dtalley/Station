{
    "attributes":[
        ["vertex", "aVertexPosition"],
        ["color", "aVertexColor"]
    ],
    "uniforms":[
        ["pm", "uPMatrix"],
        ["mvm", "uMVMatrix"]
    ]
}

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 v_colorMult;

void main(void) {
    v_colorMult = aVertexColor;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}