function glBox(gl,center, size, color) {
    this.w = size[0]/2;
    this.h = size[1]/2;
    this.d = size[2]/2;
    this.setCenter(center);
    this.color = color;
    this.init(gl);
};

glBox.prototype.init = function(gl) {    
    this.boxColors = new Float32Array(8*4);
    for(var i = 0;i<8;i++){
        this.boxColors[i*4+0] = this.color[0];
        this.boxColors[i*4+1] = this.color[1];
        this.boxColors[i*4+2] = this.color[2];
        this.boxColors[i*4+3] = this.color[3];
    }
    var boxTrianglesIndices = new Uint16Array
    ([
	0, 1, 2,  2, 1, 3,  // front
	5, 4, 7,  7, 4, 6,  // back
	4, 0, 6,  6, 0, 2,  // left
	1, 5, 3,  3, 5, 7,  // right
	2, 3, 6,  6, 3, 7,  // top
	4, 5, 0,  0, 5, 1   // bottom
    ]);

    var box = new SglMeshGL(gl);
    box.addVertexAttribute("position", 3, this.boxPositions);
    box.addVertexAttribute("color",    4, this.boxColors);
    //box.addArrayPrimitives("vertices", gl.POINTS, 0, 8);
    box.addIndexedPrimitives("triangles", gl.TRIANGLES, 
                             boxTrianglesIndices);
    this.boxMesh = box;
}

// - center: 3 element array
glBox.prototype.setCenter = function(center){
    var x = center[0];
    var y = center[1];
    var z = center[2];
    this.boxPositions = new Float32Array
    ([
	-this.w+x, -this.h+y,  this.d+z,
	this.w+x, -this.h+y,  this.d+z,
	-this.w+x,  this.h+y,  this.d+z,
	this.w+x,  this.h+y,  this.d+z,
	-this.w+x, -this.h+y, -this.d+z,
	this.w+x, -this.h+y, -this.d+z,
	-this.w+x,  this.h+y, -this.d+z,
	this.w+x,  this.h+y, -this.d+z
    ]);
}

glBox.prototype.draw = function(gl, xform, prog){
    var uniforms = {u_mvp  : xform.modelViewProjectionMatrix};
    this.boxMesh.addVertexAttribute("position", 3, this.boxPositions);
    sglRenderMeshGLPrimitives(this.boxMesh, "triangles", 
                              prog, null, uniforms);

}


