precision mediump float;

varying vec3 v_colorMult;

void main(void) {
    gl_FragColor = vec4(v_colorMult, 1.0);
}