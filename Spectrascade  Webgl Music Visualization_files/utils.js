/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

Math.nrand = function() {
    var x1, x2, rad, y1;
    do {
	x1 = 2 * this.random() - 1;
	x2 = 2 * this.random() - 1;
	rad = x1 * x1 + x2 * x2;
    } while(rad >= 1 || rad == 0);

    var c = this.sqrt(-2 * Math.log(rad) / rad);

    return x1 * c;
};


function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

//==================================================

function glUnproject(winx,winy,winz,viewportWidth,viewportHeight,mat){
    winx = 2*winx/(viewportWidth-1) - 1;
    winy = 2*winy/(viewportHeight-1) - 1;
    winz = 2*winz - 1;
    var invMat = mat4.create();
    mat4.inverse(mat,invMat);
    var n = [winx,winy,winz,1]
    mat4.multiplyVec4(invMat,n,n);
    return [n[0]/n[3],n[1]/n[3],n[2]/n[3]]
}

/* unproject - convert screen coordinate to WebGL Coordinates
 *   winx, winy - point on the screen
 *   winz       - winz=0 corresponds to newPoint and winzFar corresponds to farPoint
 *   mat        - model-view-projection matrix
 *   viewport   - array describing the canvas [x,y,width,height]
 */
function unproject(winx,winy,winz,mat,viewport){
    winx = 2 * (winx - viewport[0])/viewport[2] - 1;
    winy = 2 * (winy - viewport[1])/viewport[3] - 1;
    winz = 2 * winz - 1;
    var invMat = mat4.create();
    mat4.inverse(mat,invMat);
    var n = [winx,winy,winz,1]
    mat4.multiplyVec4(invMat,n,n);
    return [n[0]/n[3],n[1]/n[3],n[2]/n[3]]
}