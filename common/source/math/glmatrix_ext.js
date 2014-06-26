quat.zero = quat.identity(quat.create());

vec3.transformNormalMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z;
    out[1] = m[1] * x + m[5] * y + m[9] * z;
    out[2] = m[2] * x + m[6] * y + m[10] * z;
    return out;
};

mat4.abs = function(out, m) {
    out[0] = Math.abs(m[0]);
    out[1] = Math.abs(m[1]);
    out[2] = Math.abs(m[2]);
    out[3] = Math.abs(m[3]);
    out[4] = Math.abs(m[4]);
    out[5] = Math.abs(m[5]);
    out[6] = Math.abs(m[6]);
    out[7] = Math.abs(m[7]);
    out[8] = Math.abs(m[8]);
    out[9] = Math.abs(m[9]);
    out[10] = Math.abs(m[10]);
    out[11] = Math.abs(m[11]);
    out[12] = Math.abs(m[12]);
    out[13] = Math.abs(m[13]);
    out[14] = Math.abs(m[14]);
    out[15] = Math.abs(m[15]);
};

vec3.zero = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
};

vec3.one = function(out) {
    out[0] = 1;
    out[1] = 1;
    out[2] = 1;
};