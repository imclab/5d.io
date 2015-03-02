/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function Terrain(gl, center, sz, nx, nz, color) {
    this.init(gl, center, sz, nx, nz, color);
};

Terrain.prototype.init = function(gl, center, sz, nx, nz, initColor) {
    
    this.nx = nx;
    this.nz = nz;
    this.sz = sz;

    this.center = center

    // the camera will keep going on -z direction (let's say so for now)
    // anything before (larger than zOffset won't be drawn
    this.zOffset = center[2]+this.sz/2;

    this.ymap = new Array(nz*2);

    for (var i=0;i<nz*2;i++){
        this.ymap[i] = new Array(nx+1);
        for(var j=0;j<nx+1;j++){
            this.ymap[i][j] = center[1];
        }
    }
    
    this.positionArray = new Array(nz*2);
    
    for (var i=0;i<nz*2;i++)
        this.positionArray[i] = new Float32Array((nx+1)*2*3);

    this.colorArray = new Array(nz*2);

    for (var i=0;i<nz*2;i++)
        this.colorArray[i] = new Array((nx+1)*2*4);
    
    this.colorMap = new Array(nz*2);
    
    for(var i=0;i<nz*2;i++){
        this.colorMap[i] = new Array((nx+1)*4);
        for(var j=0;j<nx+1;j++){
            this.colorMap[i][j*4] = initColor[0];// + Math.random()/5;
            this.colorMap[i][j*4+1] = initColor[1];// + Math.random()/5;
            this.colorMap[i][j*4+2] = initColor[2];// + Math.random()/5;
            this.colorMap[i][j*4+3] = initColor[3];
        }
    }

    this.meshArray = new Array(nz*2);
    for(var i=0;i<nz*2;i++){
        this.meshArray[i] = new SglMeshGL(gl);
    }
    
    this.updateMeshFromMaps(gl, 0, this.zOffset, nz*2);

};

Terrain.prototype.updateMeshFromMaps = function(gl, startIdx, startZ, n){
    var gridSizeZ = this.sz/this.nz;
    for(var i=0;i<n-1;i++){
        var idx = i+startIdx;
        var gridSizeX = this.sz/this.nx;
        var startX = this.center[0]-this.sz/2;
        for(var j=0;j<this.nx;j++){
            this.positionArray[idx][j*6] = startX + gridSizeX*j;
            this.positionArray[idx][j*6+1] = this.ymap[idx][j];
            this.positionArray[idx][j*6+2] = startZ - gridSizeZ*i;
            // it's minus because things go toward -z direction

            this.positionArray[idx][j*6+3] = startX + gridSizeX*j;
            this.positionArray[idx][j*6+4] = this.ymap[idx+1][j];
            this.positionArray[idx][j*6+5] = startZ - gridSizeZ*(i+1);
        
            this.colorArray[idx][j*8] = this.colorMap[idx][j*4];
            this.colorArray[idx][j*8+1] = this.colorMap[idx][j*4+1];
            this.colorArray[idx][j*8+2] = this.colorMap[idx][j*4+2];
            this.colorArray[idx][j*8+3] = this.colorMap[idx][j*4+3];

            this.colorArray[idx][j*8+4] = this.colorMap[idx+1][j*4];
            this.colorArray[idx][j*8+5] = this.colorMap[idx+1][j*4+1];
            this.colorArray[idx][j*8+6] = this.colorMap[idx+1][j*4+2];
            this.colorArray[idx][j*8+7] = this.colorMap[idx+1][j*4+3];
        }

        this.positionArray[idx][this.nx*6] = startX + this.sz;
        this.positionArray[idx][this.nx*6+1] = this.ymap[idx][this.nx];
        this.positionArray[idx][this.nx*6+2] = startZ - gridSizeZ*i;

        this.positionArray[idx][this.nx*6+3] = startX + this.sz;
        this.positionArray[idx][this.nx*6+4] = this.ymap[idx+1][this.nx];
        this.positionArray[idx][this.nx*6+5] = startZ - gridSizeZ*(i+1);
   
        this.meshArray[i].addVertexAttribute("position", 3, this.positionArray[idx]);
        this.meshArray[i].addVertexAttribute("color", 4, new Float32Array(this.colorArray[idx]));
        this.meshArray[i].addArrayPrimitives("triangles", gl.TRIANGLE_STRIP, 0, (this.nx+1)*2);
        this.meshArray[i].addArrayPrimitives("lines", gl.LINE_STRIP, 0, (this.nx+1)*2);

    }
}

Terrain.prototype.draw= function(gl, xform, prog, startZ, n){
    var uniforms = {u_mvp : xform.modelViewProjectionMatrix};
    for (var i=startZ; i<startZ+n;i++){
        if(settings.enableGrid == false)
            sglRenderMeshGLPrimitives(this.meshArray[i], "triangles", prog, null, uniforms);
        else
            sglRenderMeshGLPrimitives(this.meshArray[i], "lines", prog, null, uniforms);
    }
}


