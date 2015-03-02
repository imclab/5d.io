/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function Stage(settings) {
    this.settings = settings;
}

Stage.prototype.dist = function(v1, v2){
    var d1 = v1[0] - v2[0];
    var d2 = v1[1] - v2[1];
    var d3 = v1[2] - v2[2];
    return Math.sqrt(d1*d1 + d2*d2 + d3*d3);
}

Stage.prototype.load = function(gl) {
    this.selfUpdate = false;
    this.locked = false;
    this.gl = gl;
    this.ctx = document.getElementById("mainCanvas");
    this.ctx.oncontextmenu = function(){return false;};
    this.ctx.onselectstart = function (){return false;}
    this.ctx.onmousedown = function (){return false;} 
    this.ctx.style.cursor = "default";
    gl.VERTEX_PROGRAM_POINT_SIZE = 0x8642;

    /*************************************************************/
    this.mouseLoc = [0,0,0];
    this.gravBallLoc = [0,.35,0];
    this.trackball = new SglTrackball();
    this.camera    = new SglFirstPersonCamera();
    this.centerX = 0.0;
    this.centerY = .2;
    this.centerZ = .7;
    this.camera.lookAt(this.centerX, this.centerY, this.centerZ,
                       0,.2,0, 
                       sglDegToRad(0.0));
    this.viewMatrix = this.camera.matrix;

    //this.cameraPos = 0; //0.9;;
    this.cameraPos = this.centerZ;
    this.cameraTotalMoved = 0;
    // initially, the camera view center is not at the block position
    // after camera moved, it will be
    // need to keep track of this to have trackball rotate correctly
    this.cameraMoved = false;
    this.viewCenter = new Array(0, 0, 0);
    this.viewCenterDist = 
        this.dist([this.centerX, this.centerY, this.centerZ], this.viewCenter);
    this.nearDist = .001;
    this.farDist = 35;
    this.autoRotateSpeedOffset = 0;
    this.ballSourceDist = this.gravBallLoc[1];
    /*************************************************************/
    this.xform     = new SglTransformStack();
    this.timestep = 0.0;
    this.animTime = 0.0;
    this.lastUpdate = 0.0;

    var particleVsrc = sglNodeText("PARTICLE_VERTEX_SHADER");
    var particleFsrc = sglNodeText("PARTICLE_FRAGMENT_SHADER");
    this.particleProg = new SglProgram(gl, [particleVsrc], [particleFsrc]);

    var particleTailVsrc = sglNodeText("PARTICLE_VERTEX_SHADER");
    var particleTailFsrc = sglNodeText("PARTICLE_TAIL_FRAGMENT_SHADER");
    this.particleTailProg = new SglProgram(gl, [particleTailVsrc], [particleTailFsrc]);

    var boxVsrc = sglNodeText("BOX_VERTEX_SHADER");
    var boxFsrc = sglNodeText("BOX_FRAGMENT_SHADER");
    this.genProg = new SglProgram(gl, [boxVsrc], [boxFsrc]);

    /*************************************************************/
    this.particleTexture = this.loadTexture(gl,settings.texture);
    this.lastTexture = settings.texture;
    this.particleSystem = new ParticleSystem(this,gl,settings);
    this.gravObjects = new Array();
//    this.gravObjects.push(new glBoundingSphere(gl,[0,0,0],0.01,[.7,.7,.8,.6],8));
    this.gravBall = new glBox(gl,[0,0,0],[0.01,0.01,0.01],[.7,.7,.8,.6],8);
//    this.sphere = new glBoundingSphere(gl,[0,0,0],0.1,[1,1,1,1])
    this.floorY =  -.5;
    // Anna: terrain test
    //this.terrain = new Terrain(gl, [0, -10, this.cameraPos], this.farDist*2,
    //                           100, 100, [.3, .3, .3, 1]);
    this.grid = new glGrid(gl,[0,this.floorY,0],1000,5000,5000,[.2,.2,.26,.1]);
    //this.grid = new glGrid(gl,[0,this.floorY,0],10,50,50,[.2,.2,.26,.1]);

    this.xTrack = 0;
    this.yTrack = 0;

}

Stage.prototype.update = function(gl, dt) {
    if(this.selfUpdate){
	this.animTime += 0.50 * dt;
        var diff = this.animTime - this.lastUpdate;
    	if(diff > this.settings.updateFreq)
	    this.doUpdate();
    }
}

Stage.prototype.doUpdate = function(isMouseUpdate){

    if(this.locked == true) return;
    var paused = this.settings.isPaused();

    //if we are updating only on mouse movement, then skip the update
    if(this.settings.mouseUpdate == true 
       && (isMouseUpdate == false || isMouseUpdate == undefined))
        paused = true;
    this.locked = true
    
    //check for changes in the settings
    if(this.lastTexture != this.settings.texture){
        this.particleTexture = this.loadTexture(this.gl,this.settings.texture);
        this.lastTexture = this.settings.texture;
    }

    //update only particle appearance if paused
    if(paused == true && this.settings.musicFXWhenPaused == true)
        this.particleSystem.updateDataOnly();

    //otherwise do a normal update
    else if(paused == false) {
        if(this.settings.cameraFollowEnabled == true){
            this.cameraMoved = true;
            var speed = this.settings.cameraSpeed;
            this.camera.translateOnPlane(0, 0, speed);
            var c = this.grid.center;
            if(Math.abs(this.cameraTotalMoved - c[2]) > 15){               
                c[2] =  this.cameraTotalMoved;
                this.grid.move(c);
            }
            this.cameraTotalMoved += speed;            
            var cameraPos = this.camera.matrix;
            var vec = new Array(3);
            
            // vec is the look-at direction of the camera
            // in camera (view) frame
            // well, and at the opisite direction 
            vec[0] = cameraPos[8];
            vec[1] = cameraPos[9];
            vec[2] = cameraPos[10];            

            // get the view center coordinate
            // (assume vec is a unit vector)
            var camInv = sglInverseM4(cameraPos);
            var camCor = new Array(3);
            camCor[0] = camInv[12];
            camCor[1] = camInv[13];
            camCor[2] = camInv[14];

            var uniVec = this.dist(vec, [0,0,0]);

            this.viewCenter[0] = camCor[0] - vec[0]/uniVec * this.viewCenterDist;
            this.viewCenter[1] = camCor[1] - vec[1]/uniVec * this.viewCenterDist;
            this.viewCenter[2] = camCor[2] - vec[2]/uniVec * this.viewCenterDist;

            // normalize vec to a unit vector
            // since we called translate on plane, y speed is omitted
            var vecNorm = Math.sqrt(vec[0]*vec[0] + vec[2]*vec[2]);
            vec[0] /= vecNorm;
            vec[2] /= vecNorm;
            // set vec to the speed of camera
            // this would never change unless the camera is rotated
            vec[0] *= speed;
            vec[1] = 0;
            vec[2] *= speed;
            
            // everything other than the view are modeled;
            // make the gravball move at the same direction/speed
            // as the camera
            var modelMat = this.trackball.matrix;
            var modelInvMat = sglInverseM4(modelMat);
            var modelVec = sglMulM4V4(modelInvMat, [vec[0], vec[1], vec[2], 0.0]);

            // now move the grav ball
            this.gravBallLoc[0] += modelVec[0];
            this.gravBallLoc[1] += modelVec[1];
            this.gravBallLoc[2] += modelVec[2];

            // now offset the particles
            var downLoc = new Array(this.gravBallLoc[0], 
                                    this.gravBallLoc[1]-this.ballSourceDist, 
                                    this.gravBallLoc[2]);
            this.particleSystem.setOffset(downLoc, modelVec);
            //this.particleSystem.setOffset(this.viewCenter, modelVec);
        }

        //****************************************************
	this.lastCameraTest = this.settings.cameraFollowEnabled;
        
        this.timestep += 1;
        this.lastUpdate = this.animTime;
        this.particleSystem.update();
    }
    this.locked = false;
},

Stage.prototype.updateXform = function(){
    var w = this.ui.width;
    var h = this.ui.height;
    // - add projection
    this.xform.projection.loadIdentity();
    this.xform.projection.perspective(sglDegToRad(55.0), w/h, this.nearDist, this.farDist);
    // - add trackball
    this.xform.model.load(this.trackball.matrix);
    // - add camera
    this.xform.view.load(this.camera.matrix);
}

Stage.prototype.draw = function(gl) {
    this.ctx.width  = window.innerWidth;
    this.ctx.height = window.innerHeight;
    var w = this.ui.width;
    var h = this.ui.height;    
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, w, h);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    //gl.enable(gl.POINT_SPRITE);
    //gl.enable(0x8642);
    //gl.enable(gl.TEXTURE_2D);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.updateXform();
    gl.lineWidth(1);
   
    this.gravBall.setCenter(this.gravBallLoc);
    this.gravBall.draw(gl,this.xform,this.genProg);
    //auto rotate
    if(settings.autoRotate == true){        
        if(this.lastAutoRotate != settings.autoRotate){
            this.trackball._pts[1][1] = this.yTrack;
            this.xTrack = this.trackball._pts[1][0];
        }
        this.trackball.action = SGL_TRACKBALL_ROTATE;
        if(this.cameraMoved == true)
            this.trackball.track(this.camera.matrix, this.xTrack, this.yTrack, 
                                 0.0, this.viewCenter);
        else
            this.trackball.track(this.camera.matrix, this.xTrack, this.yTrack, 
                                 0.0, this.gravBallLoc);
        this.xTrack += this.settings.autoRotateSpeed + this.autoRotateSpeedOffset;
        if(this.xTrack > Math.PI)
            this.xTrack = 0;
        this.trackball.action = SGL_TRACKBALL_NO_ACTION;
    }
    this.lastAutoRotate = settings.autoRotate;

    gl.lineWidth(1);        
    this.grid.draw(gl,this.xform,this.genProg);

    gl.lineWidth(settings.glLineWidth);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if(settings.pOverlay){
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.particleTexture);
    this.particleSystem.drawParticles(gl,this.xform,this.particleProg,this.particleTailProg);
    gl.depthMask(true); 
  
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
};

Stage.prototype.loadTexture = function(gl,src) {
    var texture = gl.createTexture();
    var image = new Image();
    image.src = src;
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);   

    };
    return texture;
},


//------------------------------------------------------------
// Mouse Events

Stage.prototype.mouseMove = function(gl, x, y)
{ 
    var ui = this.ui;
    var z = 1 - this.nearDist-.0004;
    this.mouseLoc = glUnproject(x, y, z,
                                    ui.width, ui.height,
                                    this.xform.modelViewProjectionMatrix);
    
    this.particleSystem.mouseMove()

    var action = SGL_TRACKBALL_NO_ACTION;
    if (ui.mouseButtonsDown[0]){
        this.gravBallLoc[0] = this.mouseLoc[0];
        this.gravBallLoc[1] = this.mouseLoc[1];
        this.gravBallLoc[2] = this.mouseLoc[2];
    } else if (ui.mouseButtonsDown[2])
    {
        action = SGL_TRACKBALL_ROTATE;
    }
    if(this.settings.autoRotate == false){
        this.trackball.action = action;
        this.trackball.track(this.camera.matrix, x/ui.width, y/ui.height, 0.0, this.viewCenter );
        this.trackball.action = SGL_TRACKBALL_NO_ACTION;
    }

    if(this.settings.mouseUpdate)
        this.doUpdate(true);
}

Stage.prototype.mouseWheel = function(gl, wheelDelta, x, y)
{
    var action = SGL_TRACKBALL_DOLLY;
    var factor = ((wheelDelta < 0.0) ? (-0.1) : (0.1));
    this.trackball.action = action;
    this.trackball.track(this.camera.matrix, 0.0, 0.0, factor);
    this.trackball.action = SGL_TRACKBALL_NO_ACTION;
}
Stage.prototype.dblClick = function(e){this.trackball.reset();}
