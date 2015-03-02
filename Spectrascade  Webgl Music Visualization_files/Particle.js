/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function Particle(stage) {
    this.settings = stage.settings;
    this.stage = stage;
    this.emitOffset = Array(0,0,0);
    this.reset();
};

Particle.prototype.reset = function(spread) {    
    if(spread == undefined)
        spread = this.settings.startSpread;
    var sx = Math.nrand()*spread;
    var sy = Math.nrand()*spread;
    var sz = Math.nrand()*spread;
    if(settings.spawnAtMouse){
        sx += this.stage.mouseLoc[0];
        sy += this.stage.mouseLoc[1];
        sz += this.stage.mouseLoc[2];
        this.locs = [sx,sy,sz];
    } else
        this.locs = 
        [sx + this.emitOffset[0],sy+this.emitOffset[1],sz+this.emitOffset[2]];

    
    this.loc_history = new Array(30);
    this.loc_history_ret = new Array(30);
    for(var i=0;i<this.loc_history.length;i++)
        this.loc_history[i] = [this.locs[0], this.locs[1], this.locs[2]];
    this.t = 0;
    this.tMod = 0;

    this.vels = [0, 0, 0]
    var velTemp = this.settings.startVelFactor;
    this.vels[0] = Math.nrand()*velTemp;
    this.vels[1] = Math.nrand()*velTemp;
    this.vels[2] = Math.nrand()*velTemp;
    this.size = 2+Math.random()*this.settings.startSizeFactor;
    this.energy = 1;
    this.index = 1;
    this.color = [.2,0.2,0.2,.6];
    this.tailColor = [0.2,0.2,0.2,.2];
    this.group = 0;

};

Particle.prototype.timestep = function(){
    this.tMod = this.t % this.loc_history.length;
    this.loc_history[this.tMod][0] = this.locs[0];
    this.loc_history[this.tMod][1] = this.locs[1];
    this.loc_history[this.tMod][2] = this.locs[2];
    this.t += 1;
    this.energy -= this.settings.particleEnergyFactor;
    this.size += this.settings.particleGrowthFactor;
    this.color = settings.getBaseParticleColor(this.energy);
    this.tailColor = settings.getBaseTailColor(this.energy);
}
Particle.prototype.getPastLocs = function(num){
    for(h = 0; h<num;h++){
        var p = 0;
        var now = this.t - 1;
        if(this.t > h){
            var n = (now - h*this.settings.particleTailLength);
            if(n < 0)
                p = n % this.loc_history.length + this.loc_history.length; 
            else
                p = n % this.loc_history.length;
        }
        this.loc_history_ret[num-h-1] = this.loc_history[p];
    }
    return this.loc_history_ret
}
