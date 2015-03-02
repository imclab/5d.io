function glGrid(gl,center, sz, nx, nz, color) {
    this.nv = ((nx+1) + (nz+1)) * 2;
    this.positions = new Array(this.nv * 3);
    this.mesh = new SglMeshGL(gl);
    this.center = center;
    this.nx = nx;
    this.nz = nz;
    this.sz = sz;
    this.gl = gl;
    this.move(center);
    this.setColor(color);
    this.mesh.addArrayPrimitives("triangles", this.gl.LINES, 0, nv);
}

glGrid.prototype.move = function(center){
    nx = this.nx;
    nz = this.nz;
    nv = this.nv;
    sz = this.sz;
    positions = this.positions;
    var f = 0.0;
    var k = 0;
    var w = this.sz/2;
    // Z-..Z+ lines
    for (var x=0; x<(nx+1); ++x)
    {
	f = -w + sz*x/nx;
        //x,y,z
	positions[k++] = f + center[0];
	positions[k++] = center[1];
	positions[k++] = -w  + center[2];
        //x,y,z
	positions[k++] = f  + center[0];
	positions[k++] = center[1];
	positions[k++] = w  + center[2];
    }

    // X-..X+ lines
    for (var z=0; z<(nz+1); ++z)
    {
	f = -w + sz*z/nz;
        //x,y,z
	positions[k++] = -w + center[0];
	positions[k++] = center[1];
	positions[k++] = f  + center[2];
        //x,y,z
	positions[k++] = w  + center[0];
	positions[k++] = center[1];
	positions[k++] = f  + center[2];;
    }
    this.center = center;
    this.numPoints = positions.length/3;
    this.positions = new Float32Array(positions)
    this.mesh.addVertexAttribute("position", 3, this.positions);

};

glGrid.prototype.setColor = function(color){    
    var colors   = new Array(this.nv * 4);
    for (var i=0; i<(this.nv*4); i+=3)
    {
        colors[i] = color[0];
        colors[i+1] = color[1];
        colors[i+2] = color[2];
        colors[i+3] = color[3];
    }
    this.mesh.addVertexAttribute("color",   4, new Float32Array(colors));
}

glGrid.prototype.draw = function(gl, xform, prog){
    var uniforms = {u_mvp  : xform.modelViewProjectionMatrix};
    sglRenderMeshGLPrimitives(this.mesh, "triangles", 
                              prog, null, uniforms);
}
