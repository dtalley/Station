var aabb = function(cx, cy, cz, ex, ey, ez) {
    this.b = new ArrayBuffer(4 * 6);
    this.c = new Float32Array(this.b, 0, 3);
    var c = this.c;
    c[0] = cx;
    c[1] = cy;
    c[2] = cz;
    this.e = new Float32Array(this.b, 12, 3);
    var e = this.e;
    e[0] = ex;
    e[1] = ey;
    e[2] = ez;
};

aabb.prototype.intersects = function(other) {
    var a = this.c, b = this.e, c = other.c, d = other.e;
    if( a[0] > c[0] + b[0] + d[0] ) return false;
    if( a[1] > c[1] + b[1] + d[1] ) return false;
    if( a[2] > c[2] + b[2] + d[2] ) return false;
    if( c[0] > a[0] + b[0] + d[0] ) return false;
    if( c[1] > a[1] + b[1] + d[1] ) return false;
    if( c[2] > a[2] + b[2] + d[2] ) return false;
    return true;
};