/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function visualsUpdate(idx) {
    var system = window.stage.particleSystem;
    var settled = system != undefined;
    var base = .01;
    var threshBase = 50;
    var nrgMult = settings.getMusicFXMultiplier();
    var meanAmpFactor = nrgMult*base*2;
    var explodeThreshold = threshBase;
    var groupSizeFactor = nrgMult*base;
    
    if(stage.terrain != undefined){
        var ymap = stage.terrain.ymap;
        var nz = stage.terrain.nz;
        var nx = stage.terrain.nx;
    }

    if(settled){
        if(settings.musicFX == true){
            if(window.meanAmp[idx] != undefined){  
                ms = (window.meanAmp[idx]*meanAmpFactor);
                settings.sizeOffset = ms;

                //--------------------------------------------------
                //EXPLODE
                if(window.meanAmp[idx] > explodeThreshold){
                    if(settings.explodeEnabled){
                        if(system.particleGroupExplodeStarted == false){
                            var nGroups = settings.numParticleGroups;
                            system.particleGroupExplodeIndex = Math.floor(Math.random()*nGroups);
                            system.particleGroupExplodeStarted = true;
                        }
                        system.particleGroupExplodeTimePassed ++;
                        if(system.particleGroupExplodeTimePassed == system.particleGroupExplodeDuration){
                            system.particleGroupExplodeStarted = false;
                            system.particleGroupExplodeTimePassed = 0;
                        }
                    }else{
                        system.particleGroupExplodeStarted = false;
                        system.particleGroupExplodeIndex = Math.floor(-1);
                        system.particleGroupExplodeTimePassed = 0;
                    }
                }
                //--------------------------------------------------
                //TERRAIN
                if(stage.terrain != undefined){
                    for(var i=0;i<nx+1;i++)
                        ymap[idx % nz][i] += window.meanAmp[idx]/30;
                }

            }

            //--------------------------------------------------
            //Bin Amplitudes
            if(window.binSum[idx] != undefined) {  
                nGroups = Math.min(window.binSum[idx].length,settings.numParticleGroups);
                max = -1000000000000;
                mean = 0;
                for(var i = 0; i<nGroups; i++){
                    mean += binSum[idx][i];
                    if(binSum[idx][i] > max)
                        max = binSum[idx][i] + 1; // make max nonzero
                }
                mean /= nGroups;

                for(var i = 0; i<nGroups; i++){
                    system.particleGroupSizeOffsets[i] = Math.pow(binSum[idx][i],1.15)*groupSizeFactor;
                    var colorArray = Array(0,0,0,0);
                    var offset = (binSum[idx][i]/max);
                    colorArray[0] = offset*settings.colorScheme.multiple[i][0];
                    colorArray[1] = offset*settings.colorScheme.multiple[i][1];
                    colorArray[2] = offset*settings.colorScheme.multiple[i][2];
                    colorArray[3] = offset*settings.colorScheme.multiple[i][3];
                    system.particleGroupColorOffsets[i] = colorArray;		
                    system.particleGroupTailColorOffsets[i] = colorArray;
                }

                if(stage.terrain != undefined){
                    var xPerGroup = (nx+1)/nGroups;
                    var till = xPerGroup;
                    var groupidx = 0;
                    for(var i=0;i<nx+1;i++){
                        if(i == till){
                            till += xPerGroup;
                            groupidx++;
                            if(groupidx == nGroups)
                                groupidx = nGroups-1;
                        }
                        ymap[idx%nz][i] += window.binSum[idx][groupidx]/300;
                    }
                }

            }

        } else{

            var nGroups = system.particleGroupSizeOffsets.length; 
            for(i = 0; i<nGroups;i++){
                system.particleGroupSizeOffsets[i] = 0;
                system.particleGroupColorOffsets[i] = new Array(0,0,0,0);
                system.particleGroupTailColorOffsets[i] = new Array(0,0,0,0);
            }
        }
        if(window.topIndices[idx] != undefined){
            if(settings.multiSourceEnabled == true){
                var topidx = topIndices[idx][topIndices[idx].length-1];
                //                var d = (topidx-200)/800;
                var d = (topidx/400) * 2 * Math.PI;
                system.particleEmitOffset[0] = Math.cos(d)*.3;
                system.particleEmitOffset[1] = Math.sin(d)*.3+.2;
            }
            else{
                system.particleEmitOffset[0] = 0;
                system.particleEmitOffset[1] = .1;
            }

        }
        stage.doUpdate();
    }
}
