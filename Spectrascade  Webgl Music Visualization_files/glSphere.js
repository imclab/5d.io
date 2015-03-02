//center: [x,y,z], radius, color: [r,g,b,a]
function glSphere(gl, center, radius, color) {
    this.radius = radius;
    this.color = color;
    this.center = center;
    this.init(gl);
};
glSphere.prototype.init = function(gl) {    
    var latitudeBands = 15;
    var longitudeBands = 15;
    var radius = this.radius;
    this.initialPosData = [];
    var colorData = [];
    var indexData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta); 
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1- (longNumber / longitudeBands);
            var v = latNumber / latitudeBands;
            
            this.initialPosData.push(radius * x);
            this.initialPosData.push(radius * y);
            this.initialPosData.push(radius * z);
            colorData.push(this.color[0]);
            colorData.push(this.color[1]);
            colorData.push(this.color[2]);
            colorData.push(this.color[3]);

        }
    }
    //set indices
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) 
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            //set indices
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);            
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }


    var sphere = new SglMeshGL(gl);
    this.spherePositions = new Float32Array(this.initialPosData);
    sphere.addVertexAttribute("position", 3, this.spherePositions);
    sphere.addArrayPrimitives("vertices", gl.POINTS, 0, this.initialPosData.length/3);
    sphere.addVertexAttribute("color",    4, new Float32Array(colorData));
    sphere.addIndexedPrimitives("triangles", gl.TRIANGLES,
                                new Uint16Array(indexData));
    this.sphereMesh = sphere;
}


glSphere.prototype.draw = function(gl, xform, prog){
    var uniforms = {u_mvp  : xform.modelViewProjectionMatrix};
    sglRenderMeshGLPrimitives(this.sphereMesh, "triangles", 
                              prog, null, uniforms);    
}

//======================================================================

//center: [x,y,z], radius, color: [r,g,b,a]
function glBoundingSphere(gl, center, radius, color, longLines) {
    this.radius = radius;
    this.color = color;
    this.center = center;
    this.longLines = longLines;
    this.init(gl);
};
glBoundingSphere.prototype.init = function(gl) {    
    var latitudeBands = 20;
    var longitudeBands = this.longLines;
    var radius = this.radius;
    this.initialPosData = [];
    var colorData = [];
    var indexData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta); 
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1- (longNumber / longitudeBands);
            var v = latNumber / latitudeBands;
            
            this.initialPosData.push(radius * x);
            this.initialPosData.push(radius * y);
            this.initialPosData.push(radius * z);

            colorData.push(this.color[0]);
            colorData.push(this.color[1]);
            colorData.push(this.color[2]);
            colorData.push(this.color[3]);
        }
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) 
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first);            
            indexData.push(second);
            indexData.push(second +1);
            indexData.push(first +1);
        }    

    var sphere = new SglMeshGL(gl);
    this.spherePositions = new Float32Array(this.initialPosData);
    sphere.addVertexAttribute("position", 3, this.spherePositions);
    sphere.addArrayPrimitives("vertices", gl.POINTS, 0, this.initialPosData.length/3);
    sphere.addVertexAttribute("color",    4, new Float32Array(colorData));
    sphere.addIndexedPrimitives("lines", gl.LINES,
                                new Uint16Array(indexData));
    this.sphereMesh = sphere;
}


glBoundingSphere.prototype.draw = function(gl, xform, prog){
    var uniforms = {u_mvp  : xform.modelViewProjectionMatrix};
   /* sglRenderMeshGLPrimitives(this.sphereMesh, "vertices", 
                              prog, null, uniforms);    */
    sglRenderMeshGLPrimitives(this.sphereMesh, "lines", 
                              prog, null, uniforms);    
}

