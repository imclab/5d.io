/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function ColorScheme(){
    
    this.ngroups = Settings.numParticleGroups;

    this.offset = Array(0, 0, 0, 0);

    this.colorScheme1 = function(color, i, e, amp, gi){
        var base = i*4;
        color[base] = e*.8;
        color[base+1] =  0;
        color[base+2] = .8*(1-e);
        color[base+3] = .6;
        if(gi < this.ngroups/8);
        else if(gi < this.ngroups/4){
            this.offset[0] = 2*amp;
            this.offset[1] = 2*amp;
            color[base] = Math.min(Math.max(color[base] + this.offset[0], 0), 1);
            color[base+1] = Math.min(Math.max(color[base+1] + this.offset[1], 0), 1);
        }
        else if(gi < this.ngroups/2){
            this.offset[1] = 3*amp;
            color[base+1] = Math.min(Math.max(color[base+1] + this.offset[1], 0), 1);
        }
        else if(gi < this.ngroups*3/4){
            this.offset[1] = 6*amp;
            color[base+1] = Math.min(Math.max(color[base+1] + this.offset[1], 0), 1);
        }
        else{
            this.offset[0] = amp;
            this.offset[1] = 3*amp;
            this.offset[2] = 2*amp;
            color[base] = Math.min(Math.max(color[base] + this.offset[0], 0), 1);
            color[base+1] = Math.min(Math.max(color[base+1] + this.offset[1], 0), 1);
            color[base+2] = Math.min(Math.max(color[base+2] + this.offset[2], 0), 1);
        }
    }

    this.trailColorScheme1 = function(trailColor, e, ad){
        trailColor[0] = Math.min(Math.max(this.offset[0] + e*(1-ad) + ad, 0), 1);
        trailColor[1] = Math.min(Math.max(this.offset[1] + ad, 0), 1);
        trailColor[2] = Math.min(Math.max(this.offset[2] + ad + (1-ad)*(1-e), 0), 1);
        trailColor[3] = .4;
    }

    this.trailColor2Scheme1 = function(trailColor2, trailColor, alpha){
    }

}


function MultiplicativeColorScheme(nGroups){

    this.multiple = new Array(nGroups);

    this.colorScheme1 = function(){
        var nGroups = this.multiple.length;
        this.getParticleBase = function(energy){
            return [energy*.8, 0, .8*(1-energy),.4+0.3*energy]
        }
        this.getTailBase = function(energy){
            var ad = .3;
            return [energy*(1-ad) + ad, ad, ad+ (1-ad)*(1-energy),.15+.1*energy]
        }
        for(var i=0;i<nGroups;i++){
            this.multiple[i] = new Array(0, 0, 0, 0);
            if(i < nGroups/8){
                ;
            }
            else if(i< nGroups/4){
                this.multiple[i][0] = 2;
                this.multiple[i][1] = 2;
            }
            else if(i< nGroups/2)
                this.multiple[i][1] = 3;
            else if(i < nGroups*3/4)
                this.multiple[i][1] = 6;
            else{
                this.multiple[i][0] = 1;
                this.multiple[i][1] = 3;
                this.multiple[i][2] = 2;
            }
        }
    }

    this.colorScheme2 = function(){
        var nGroups = this.multiple.length;
        this.getParticleBase = function(energy){
            return [.2+energy*.4, .2+.3*(1-energy),0,.4+.3*energy]
        }
        this.getTailBase = function(energy){
            return [.6+energy*.4, .4+.3*(1-energy),0,.15+.1*energy]
        }
        for(var i=0;i<nGroups;i++){
            if(i < nGroups/8){
                ;
            }
            else if(i< nGroups/4){
                this.multiple[i][0] = 2;
                this.multiple[i][1] = 2;
                this.multiple[i][2] = 2;
            }else if(i< nGroups/2){
                this.multiple[i][0] = 4;
                this.multiple[i][1] = 3;
                this.multiple[i][2] = 6;
            }else if(i < nGroups*3/4){
                this.multiple[i][0] = 4;
                this.multiple[i][1] = -5;
                this.multiple[i][2] = +1;
            }else{
                this.multiple[i][0] = 6;
                this.multiple[i][1] = -1;
                this.multiple[i][2] = -1;
            }
        }
    }

    this.colorScheme3= function(){
        var nGroups = this.multiple.length;
        this.getParticleBase = function(energy){
            return [.6,.6,.6 + .2*energy,.4+.3*energy]
        }
        this.getTailBase = function(energy){
            return [.6,.6,.6 + .2*energy,.15+.1*energy]
        }
        for(var i=0;i<nGroups;i++){
            if(i < nGroups/8){
                ;
            }
            else if(i< nGroups/4){
                this.multiple[i][0] = -2;
                this.multiple[i][1] = 5;
                this.multiple[i][2] = 4;
            }
            else if(i< nGroups/2){
                this.multiple[i][0] = 3;
                this.multiple[i][1] = -5;
                this.multiple[i][2] = -10;
            }else if(i < nGroups*3/4){
                this.multiple[i][0] = 8;
                this.multiple[i][1] = -2;
                this.multiple[i][2] = 4;
            }else{
                this.multiple[i][0] = -2;
                this.multiple[i][1] = -2;
                this.multiple[i][2] = 5;
            }
        }
    }
}

