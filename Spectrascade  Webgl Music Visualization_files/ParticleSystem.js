/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function ParticleSystem(stage,gl,settings) {
    this.settings = settings;
    this.stage = stage;
    this.start(gl);
}

ParticleSystem.prototype.start = function(gl){
    this.maxParticles = parseInt(this.settings.maxParticles);
    //Particle Groups
    this.particleGroupSizeOffsets = Array(settings.numParticleGroups);
    this.particleGroupColorOffsets = Array(settings.numParticleGroups);
    this.particleGroupTailColorOffsets = Array(settings.numParticleGroups);
    for(var i = 0;i<this.particleGroupSizeOffsets.length;i++){
        this.particleGroupSizeOffsets[i] = 0;
        this.particleGroupColorOffsets[i] = new Array(0,0,0,0);
        this.particleGroupTailColorOffsets[i] = new Array(0,0,0,0);
    }
    this.particleGroupExplodeIndex = 0;
    this.particleGroupExplodeGravExp = 0;
    this.particleGroupExplodePosiGravF = 0.05;
    this.particleGroupExplodeNegaGravF = -0.05;
    this.particleGroupExplodeDuration = 3;
    this.particleGroupExplodeStarted = false;
    this.particleGroupExplodeTimePassed = 0;

    this.particleEmitOffset = new Array(0,0,0);
    this.particleEmitTempOffset = new Array(0,0,0);
 
    this.particleGroupPointer = 0;
    this.particleGroupCounter = 0;
    
    /*************************************************************/
    this.particles = new Array(this.maxParticles);//actual particles
    this.particlesActive = new Array(this.maxParticles);
    //inactive particles
    this.particleStack = new Array(this.maxParticles);
    this.particleStackPointer = 0;

    this.numCreated = 0;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.colors = new Float32Array(this.maxParticles*4);
    this.dead = new Array(this.maxParticles);
    for(var i=0;i<=this.maxParticles;i++){           
        for(j = 0; j<3;j++)
            this.positions[i*3+j] = 20;
        for(j = 0; j<4;j++)
            this.colors[i*4+j] = 0;
        this.sizes[i] = 4;
        this.particlesActive[i] = false;
        this.particles[i] = new Particle(this.stage);
        this.particleStack[this.particleStackPointer] = i;
        this.particleStackPointer++; 
    }

    var particlesMesh = new SglMeshGL(gl);
    particlesMesh.addVertexAttribute("size", 1, this.sizes);
    particlesMesh.addVertexAttribute("color", 4, this.colors);
    particlesMesh.addVertexAttribute("position", 3, this.positions);
    particlesMesh.addArrayPrimitives("vertices", gl.POINTS, 0, this.maxParticles);
    this.particlesMesh = particlesMesh;

    /*************************************************************/
    this.numTailPoints = 6;

    this.tailPositions = new Float32Array(this.maxParticles * 3 * this.numTailPoints);
    this.tailColors = new Float32Array(this.maxParticles * 4 * this.numTailPoints);
    for(var i=0;i<=this.maxParticles*3*this.numTailPoints;i++)
        this.tailPositions[i] = 20;
    for(var i=0;i<=this.maxParticles*4*this.numTailPoints;i++)
        this.tailColors[i] = 0;

    var tailsMesh = new SglMeshGL(gl);
    tailsMesh.addVertexAttribute("position", 3, this.tailPositions);
    tailsMesh.addVertexAttribute("color", 4, this.tailColors);
    tailsMesh.addArrayPrimitives("lines", gl.LINES, 0, 
                                  this.maxParticles*this.numTailPoints);
    this.tailsMesh = tailsMesh;
}

ParticleSystem.prototype.mouseMove = function() {
    if(this.settings.spawnAtMouse)
        this.emit(this.settings.getSpawnPerStep(),this.settings.startSpread*.1);
}

ParticleSystem.prototype.emit = function(num,spread) {
    var p = null;
    var i = 0;
    while(num-- ) {
	if(this.particleStackPointer > this.settings.maxParticles-this.settings.particleLimit) {
            this.particleStackPointer--;
            i = this.particleStack[this.particleStackPointer];
            this.particlesActive[i] = true;
	    p = this.particles[i];
	    p.emitOffset = this.particleEmitOffset;
            p.reset(spread);
	    
            //add particle to appropriate group
            p.group = this.particleGroupPointer;
            this.particleGroupCounter++;
            if(this.particleGroupCounter > this.settings.getParticleGroupMod()){
                this.particleGroupPointer = (this.particleGroupPointer+1) 
                    % settings.numParticleGroups;
                this.particleGroupCounter = 0;
            }
            if(p.locs[1] < this.floorY)
                p.locs[1] = this.floorY;
        }
    }
}
//update the global data for particle i
ParticleSystem.prototype.updateParticleData = function(i){
    var p = this.particles[i];
    //get the historical points of the particle

    var ik = i*this.numTailPoints;;
    var c = 0;
    var group = p.group;

    //UPDATE PARTICLES
    for(var j = 0; j<3; j++){ //loop over dimensions
        this.positions[i*3 + j] = p.locs[j];

    }
    for(var j = 0; j<4; j++){
        c = p.color[j] + this.particleGroupColorOffsets[group][j];
        if(c < 0) c = 0; if(c>1) c = 1;
        this.colors[i*4 + j] = c
      }
    this.sizes[i] = p.size + this.settings.getParticleSizeBase()
        + this.particleGroupSizeOffsets[group];


    //UPDATE TAILS
    if(this.settings.particleTailLength > 0){
        var h = p.getPastLocs(this.numTailPoints/2+1);
        //loc
        for(var j = 0; j<3; j++){
            for(var k = 0;k<this.numTailPoints;k++){
                var ind = Math.floor((k+1)/2)
                this.tailPositions[(ik+k)*3 + j] = h[ind][j];
            }
        }
        //color
        for(var j = 0; j<4; j++){
            c = p.tailColor[j] + this.particleGroupTailColorOffsets[group][j];
            if(c < 0) c = 0; if(c>1) c = 1;   
            for(var k = 0;k<this.numTailPoints;k++)
                this.tailColors[(ik+k)*4 + j] = c
        }
        c = this.tailColors[(i*this.numTailPoints+1)*4 + 3]
        if(c > .2) c = .2;
        this.tailColors[(i*this.numTailPoints+1)*4 + 3] = c;
        this.tailColors[(i*this.numTailPoints+2)*4 + 3] = c;
        this.tailColors[(i*this.numTailPoints)*4 + 3] = 0;
        if(this.settings.pOverlay)
            for(var k = 0;k<this.numTailPoints;k++)
                this.tailColors[(ik+k)*4 + 3] *= .4;
    }
}

//send particle position/color/size information to shaders
ParticleSystem.prototype.sendParticleData = function(){
    this.particlesMesh._vert._attribs["position"]._buff.subData(this.positions);
    this.particlesMesh._vert._attribs["color"]._buff.subData(this.colors);
    this.particlesMesh._vert._attribs["size"]._buff.subData(this.sizes);
    this.tailsMesh._vert._attribs["position"]._buff.subData(this.tailPositions);
    this.tailsMesh._vert._attribs["color"]._buff.subData(this.tailColors);
}

ParticleSystem.prototype.removeDeadParticles = function(deadIndex){
    for(var d = 0; d<deadIndex; d++){
        var i = this.dead[d];
        var ik = i*this.numTailPoints;;
	// Remove and pool this particle
        this.sizes[i] = 0;
        this.particleStack[this.particleStackPointer] = i;
        this.particleStackPointer++;
        this.particlesActive[i] = false;
        for(var j = 0; j<3; j++){
            this.positions[i*3 + j] = 20;
            for(var k = 0;k<this.numTailPoints;k++)
                this.tailPositions[(i*this.numTailPoints+k)*3 + j] = 20;
        }
        for(var j = 0; j<3; j++){
            this.colors[i*4 + j] = 0;
            for(var k = 0;k<this.numTailPoints;k++)
                this.tailColors[(ik+k)*4 + 3] = 0;
        }

    }
}

ParticleSystem.prototype.addOffset = function(xOff, yOff, zOff){
    this.particleEmitOffset[0] += xOff;
    this.particleEmitOffset[1] += yOff;
    this.particleEmitOffset[2] += zOff;
    this.particleEmitTempOffset[0] = xOff;
    this.particleEmitTempOffset[1] = yOff;
    this.particleEmitTempOffset[2] = zOff;
}

ParticleSystem.prototype.setOffset = function(offset, extraSpeed){
    this.particleEmitOffset[0] = offset[0];
    this.particleEmitOffset[1] = offset[1];
    this.particleEmitOffset[2] = offset[2];
    this.particleEmitTempOffset[0] = extraSpeed[0];
    this.particleEmitTempOffset[1] = extraSpeed[1];
    this.particleEmitTempOffset[2] = extraSpeed[2];
}

ParticleSystem.prototype.updateDataOnly = function(){
   for(var i=0;i<this.maxParticles;i++){
        if(this.particlesActive[i]){
            this.updateParticleData(i);
        }
   }
   this.sendParticleData();
}

ParticleSystem.prototype.update = function(){
    if(!this.settings.spawnAtMouse)
        this.emit(this.settings.getSpawnPerStep());
    var timestep = this.stage.timestep;
    var deadIndex = 0;
    var p;
    var gravSource = this.stage.gravBallLoc;
    this.gravSourceX = gravSource[0];
    this.gravSourceY = gravSource[1];
    this.gravSourceZ = gravSource[2];

    for(var i=0;i<this.maxParticles;i++){
        if(this.particlesActive[i]){
            p = this.particles[i];
            if(p.energy > 0) {
                p.locs[0] += p.vels[0] + this.particleEmitTempOffset[0];
                p.locs[1] += p.vels[1] + this.particleEmitTempOffset[1];
                p.locs[2] += p.vels[2] + this.particleEmitTempOffset[2];
                for(var j=0;j<3;j++)
                    p.locs[j] += p.vels[j];   
                p.timestep();                    
                this.physicsIter(p);
                this.updateParticleData(i);
 	    } else {
                this.dead[deadIndex] = i;
                deadIndex++;
	    }
        }
    }    
    this.removeDeadParticles(deadIndex);
    this.sendParticleData();
    this.particleEmitTempOffset[2] = 0;
}

ParticleSystem.prototype.physicsIter = function(p) { 
    //mouse attraction
    var x = p.locs[0];
    var y = p.locs[1];
    var z = p.locs[2];
    var r = Math.sqrt(Math.pow(this.gravSourceX - x,2)
                      +Math.pow(this.gravSourceY - y,2)
                      +Math.pow(this.gravSourceZ - z,2));
    var theta = Math.atan((this.gravSourceY-y)/(this.gravSourceX-x));
    var phi  =  Math.acos((this.gravSourceZ-z)/(r));
    var dx,dy,dz;
    if(x > this.gravSourceX){
        dx = -Math.cos(theta) * Math.sin(phi)
        dy = -Math.sin(theta) * Math.sin(phi)
    }else{
        dx = Math.cos(theta) * Math.sin(phi)
        dy = Math.sin(theta) * Math.sin(phi);
    }
    dz = Math.cos(phi)
    if(this.settings.gravForce != 0){
        if(this.particleGroupExplodeStarted == true && 
           this.particleGroupExplodeIndex == p.group){
	    if(this.particleGroupExplodeTimePassed < 
               this.particleGroupExplodeDuration / 2){
	        grav = this.particleGroupExplodePosiGravF * 
                    1/Math.pow(r, this.particleGroupExplodeGravExp);
	    }
	    else{
	        grav = this.particleGroupExplodeNegaGravF * 
                    1/Math.pow(r, this.particleGroupExplodeGravExp);
	    }	
        }
        else{
            grav = this.settings.gravForce * 1/Math.pow(r,settings.gravDistFactor);

        }
        grav = Math.min(grav,this.settings.gravMax);
    } else{
        grav = 0;
    }
    var damping = this.settings.particleVDamping;

    p.vels[0] = (p.vels[0] + grav * dx)*damping;
    p.vels[1] = (p.vels[1] + grav * dy)*damping;
    p.vels[2] = (p.vels[2] + grav * dz)*damping;

    var vel = 0;
    var max_vel = this.settings.particleMaxV;
    for(var k = 0;k<3;k++){
        vel += Math.pow(p.vels[k],2);
    }
    if(vel > max_vel){
        for(var k = 0;k<3;k++){
            p.vels[k] *= max_vel/vel;
        }
    }
    p.vels[1] -= this.settings.downwardGrav;
}

// --------------------------------------------------
ParticleSystem.prototype.drawParticles = function(gl,xform,particleProg,tailProg) {
    var uniforms = {
        u_mvp              : xform.modelViewProjectionMatrix};	
    var samplers = {s_texture : 0};
    //draw tails
    if(!settings.pOverlay){
	sglRenderMeshGLPrimitives(this.particlesMesh, "vertices", 
                                  particleProg, null, uniforms, samplers);
        
        if(this.settings.particleTailLength > 0){
   	    sglRenderMeshGLPrimitives(this.tailsMesh, "lines", 
                                      tailProg, null, uniforms);
        }
    } else{
        if(this.settings.particleTailLength > 0){
   	    sglRenderMeshGLPrimitives(this.tailsMesh, "lines", 
                                      tailProg, null, uniforms);
        }
        sglRenderMeshGLPrimitives(this.particlesMesh, "vertices", 
                                  particleProg, null, uniforms, samplers);
    }
};

